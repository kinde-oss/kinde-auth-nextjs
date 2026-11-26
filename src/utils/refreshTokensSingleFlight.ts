import {
  KindeSDKError,
  KindeSDKErrorCode,
  OAuth2CodeExchangeResponse,
  SessionManager,
} from "@kinde-oss/kinde-typescript-sdk";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { validateToken } from "@kinde/jwt-validator";
import { kindeClient } from "../session/kindeServerClient";
import { config } from "../config";
import { isTokenExpired } from "./jwt/validation";
import { tagRefreshErrorWithFlightId } from "./staleRefreshTokenGuard";

type InFlightRefresh = {
  promise: Promise<OAuth2CodeExchangeResponse>;
  refs: number;
  flightId: string;
  /** Set when the shared network call resolves successfully. */
  resolvedTokens?: OAuth2CodeExchangeResponse;
};

type CachedRefreshResult = {
  tokens: OAuth2CodeExchangeResponse;
  expiresAt: number;
};

/**
 * In-process single-flight map keyed by the refresh token being exchanged.
 *
 * Best-effort within a single runtime only: Next.js middleware and route
 * handlers ship as separate bundles with separate module state, so middleware
 * + `/api/auth/setup` do not share this map. Cross-runtime races still rely on
 * SDK `STALE_REFRESH_TOKEN`, the short TTL cache below (per runtime), and
 * client/setup retry behaviour.
 *
 * Entries stay registered until every waiter finishes (including optional
 * session commit). Successful results stay cached under the old refresh token
 * for a few seconds so late arrivals with the pre-rotation cookie reuse the
 * winner's tokens instead of exchanging an already-rotated token.
 *
 * The shared call always uses commitToSession=false so waiters are not tied to
 * another request's session manager. Callers that need persistence commit after.
 */
const inFlightByRefreshToken = new Map<string, InFlightRefresh>();
const recentSuccessByRefreshToken = new Map<string, CachedRefreshResult>();
const SUCCESS_CACHE_TTL_MS = 5_000;
let flightIdCounter = 0;

const asRefreshTokenKey = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

/**
 * Mirrors SDK commitTokensToSession: validate access/id tokens, confirm the
 * session still holds the flight's refresh token, apply ksp.persistent, then
 * write. Used when commitToSession=true after a shared commitToSession=false
 * network refresh.
 */
const commitTokensToSessionManager = async (
  session: SessionManager,
  tokens: OAuth2CodeExchangeResponse,
  expectedRefreshToken?: string | null,
): Promise<void> => {
  const assertAccessOrIdValid = async (
    type: "access_token" | "id_token",
    token: string | undefined,
  ): Promise<void> => {
    if (!token) {
      return;
    }

    try {
      const validation = await validateToken({
        token,
        domain: config.issuerURL,
      });
      if (!validation.valid) {
        throw new Error(validation.message || `Invalid ${type}`);
      }
      if (isTokenExpired(token)) {
        throw new Error(`${type} is expired`);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Attempting to commit invalid ${type} token`;
      throw new KindeSDKError(
        KindeSDKErrorCode.INVALID_TOKEN_MEMORY_COMMIT,
        `Attempting to commit invalid ${type} token to memory: ${message}`,
      );
    }
  };

  // Validate before any writes so a bad access/id token cannot partially
  // persist a rotated refresh token.
  await Promise.all([
    assertAccessOrIdValid("access_token", tokens.access_token),
    assertAccessOrIdValid("id_token", tokens.id_token),
  ]);

  // Re-read after validation so a rotation during validation blocks the writes.
  if (expectedRefreshToken) {
    const current = await session.getSessionItem("refresh_token");
    if (current !== expectedRefreshToken) {
      if (config.isDebugMode) {
        console.debug(
          "refreshTokensSingleFlight: skipping commit; session refresh token changed",
        );
      }
      return;
    }
  }

  // Only mutate persistence after we know we will commit.
  const payload = jwtDecoder<{ ksp?: { persistent?: boolean } }>(
    tokens.access_token,
  );
  if (payload) {
    session.persistent = payload.ksp?.persistent ?? true;
  }

  await Promise.all([
    tokens.access_token
      ? session.setSessionItem("access_token", tokens.access_token)
      : session.removeSessionItem("access_token"),
    tokens.id_token
      ? session.setSessionItem("id_token", tokens.id_token)
      : session.removeSessionItem("id_token"),
    tokens.refresh_token
      ? session.setSessionItem("refresh_token", tokens.refresh_token)
      : session.removeSessionItem("refresh_token"),
  ]);
};

const releaseInFlight = (key: string, flight: InFlightRefresh): void => {
  flight.refs -= 1;
  if (flight.refs <= 0 && inFlightByRefreshToken.get(key) === flight) {
    inFlightByRefreshToken.delete(key);
  }
};

const pruneExpiredSuccessCache = (now: number = Date.now()): void => {
  for (const [cacheKey, entry] of recentSuccessByRefreshToken) {
    if (now > entry.expiresAt) {
      recentSuccessByRefreshToken.delete(cacheKey);
    }
  }
};

/**
 * Drop success-cache and resolved in-flight entries whose *returned* refresh
 * token is about to be exchanged (or already was), so late arrivals never
 * reuse a spent refresh token. Waiters that already hold a flight reference
 * keep it; releaseInFlight only deletes when the map still points at that
 * same flight object (replacement flights are left alone).
 */
const invalidateCacheEntriesForExchangedToken = (
  exchangedRefreshToken: string,
): void => {
  for (const [cacheKey, entry] of recentSuccessByRefreshToken) {
    if (entry.tokens.refresh_token === exchangedRefreshToken) {
      recentSuccessByRefreshToken.delete(cacheKey);
    }
  }
  for (const [flightKey, flight] of inFlightByRefreshToken) {
    if (flight.resolvedTokens?.refresh_token !== exchangedRefreshToken) {
      continue;
    }
    if (inFlightByRefreshToken.get(flightKey) === flight) {
      inFlightByRefreshToken.delete(flightKey);
    }
  }
};

const getCachedSuccess = (key: string): OAuth2CodeExchangeResponse | null => {
  pruneExpiredSuccessCache();
  const cached = recentSuccessByRefreshToken.get(key);
  if (!cached) {
    return null;
  }
  if (Date.now() > cached.expiresAt) {
    recentSuccessByRefreshToken.delete(key);
    return null;
  }
  return cached.tokens;
};

const cacheSuccess = (
  key: string,
  tokens: OAuth2CodeExchangeResponse,
): void => {
  const now = Date.now();
  pruneExpiredSuccessCache(now);
  recentSuccessByRefreshToken.set(key, {
    tokens,
    expiresAt: now + SUCCESS_CACHE_TTL_MS,
  });
};

export const refreshTokensSingleFlight = async (
  session: SessionManager,
  commitToSession: boolean = true,
): Promise<OAuth2CodeExchangeResponse> => {
  let key = asRefreshTokenKey(await session.getSessionItem("refresh_token"));

  // Confirm the key immediately before cache/flight/network work so we register
  // under the token the SDK will re-read and exchange (one re-read only).
  if (key) {
    const confirmed = asRefreshTokenKey(
      await session.getSessionItem("refresh_token"),
    );
    if (confirmed !== key) {
      if (config.isDebugMode) {
        console.debug(
          "refreshTokensSingleFlight: refresh token changed before flight; adopting current key",
        );
      }
      key = confirmed;
    }
  }

  const runNetworkRefresh = (): Promise<OAuth2CodeExchangeResponse> =>
    kindeClient.refreshTokens(session, false);

  let tokens: OAuth2CodeExchangeResponse;
  let flight: InFlightRefresh | null = null;

  if (!key) {
    tokens = await runNetworkRefresh();
  } else {
    // This key is being exchanged — any cached result that *returned* this
    // token as the new refresh token is now spent.
    invalidateCacheEntriesForExchangedToken(key);

    const cached = getCachedSuccess(key);
    if (cached) {
      if (config.isDebugMode) {
        console.debug(
          "refreshTokensSingleFlight: serving cached refresh result for rotated token",
        );
      }
      tokens = cached;
    } else {
      flight = inFlightByRefreshToken.get(key) ?? null;
      if (!flight) {
        if (config.isDebugMode) {
          console.debug("refreshTokensSingleFlight: starting refresh");
        }
        const flightKey = key;
        const flightId = `rf-${++flightIdCounter}-${Date.now()}`;
        let pending!: InFlightRefresh;
        const promise = runNetworkRefresh()
          .then((result) => {
            pending.resolvedTokens = result;
            cacheSuccess(flightKey, result);
            return result;
          })
          .catch((error) => {
            // Failed flights must not block retries.
            if (inFlightByRefreshToken.get(flightKey)?.promise === promise) {
              inFlightByRefreshToken.delete(flightKey);
            }
            throw tagRefreshErrorWithFlightId(error, flightId);
          });
        pending = { promise, refs: 0, flightId };
        flight = pending;
        inFlightByRefreshToken.set(flightKey, flight);
      } else if (config.isDebugMode) {
        console.debug(
          "refreshTokensSingleFlight: joining in-flight refresh for session",
        );
      }

      flight.refs += 1;
      try {
        tokens = await flight.promise;
      } catch (error) {
        releaseInFlight(key, flight);
        throw error;
      }
    }
  }

  try {
    if (commitToSession) {
      await commitTokensToSessionManager(session, tokens, key);
    }
    return tokens;
  } finally {
    if (key && flight) {
      releaseInFlight(key, flight);
    }
  }
};

/** Test helper — clears in-flight map and success cache between cases. */
export const __resetRefreshTokensSingleFlightForTests = (): void => {
  inFlightByRefreshToken.clear();
  recentSuccessByRefreshToken.clear();
  flightIdCounter = 0;
};
