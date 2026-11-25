import {
  OAuth2CodeExchangeResponse,
  SessionManager,
} from "@kinde-oss/kinde-typescript-sdk";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { validateToken } from "@kinde/jwt-validator";
import { kindeClient } from "../session/kindeServerClient";
import { config } from "../config";
import { isTokenExpired } from "./jwt/validation";

type InFlightRefresh = {
  promise: Promise<OAuth2CodeExchangeResponse>;
  refs: number;
};

/**
 * In-process single-flight map keyed by the refresh token being exchanged.
 * Concurrent middleware/setup refreshes with the same token share one network
 * call (best-effort; separate serverless isolates still need the SDK's
 * STALE_REFRESH_TOKEN behaviour).
 *
 * Entries stay registered until every waiter finishes (including optional
 * session commit), so a late caller cannot start a second exchange of R while
 * the first flight's tokens are still being validated/persisted.
 *
 * The shared call always uses commitToSession=false so waiters are not tied to
 * another request's session manager. Callers that need persistence commit after.
 */
const inFlightByRefreshToken = new Map<string, InFlightRefresh>();

/**
 * Mirrors SDK commitTokensToSession: apply ksp.persistent, validate access/id
 * tokens, then write. Used when commitToSession=true after a shared
 * commitToSession=false network refresh.
 */
const commitTokensToSessionManager = async (
  session: SessionManager,
  tokens: OAuth2CodeExchangeResponse,
): Promise<void> => {
  const payload = jwtDecoder<{ ksp?: { persistent?: boolean } }>(
    tokens.access_token,
  );
  if (payload) {
    session.persistent = payload.ksp?.persistent ?? true;
  }

  const assertAccessOrIdValid = async (
    type: "access_token" | "id_token",
    token: string | undefined,
  ): Promise<void> => {
    if (!token) {
      return;
    }

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
  };

  // Validate before any writes so a bad access/id token cannot partially
  // persist a rotated refresh token.
  await Promise.all([
    assertAccessOrIdValid("access_token", tokens.access_token),
    assertAccessOrIdValid("id_token", tokens.id_token),
  ]);

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

export const refreshTokensSingleFlight = async (
  session: SessionManager,
  commitToSession: boolean = true,
): Promise<OAuth2CodeExchangeResponse> => {
  const refreshToken = await session.getSessionItem("refresh_token");
  const key =
    typeof refreshToken === "string" && refreshToken.length > 0
      ? refreshToken
      : null;

  const runNetworkRefresh = (): Promise<OAuth2CodeExchangeResponse> =>
    kindeClient.refreshTokens(session, false);

  let tokens: OAuth2CodeExchangeResponse;
  let flight: InFlightRefresh | null = null;

  if (!key) {
    tokens = await runNetworkRefresh();
  } else {
    flight = inFlightByRefreshToken.get(key) ?? null;
    if (!flight) {
      if (config.isDebugMode) {
        console.debug("refreshTokensSingleFlight: starting refresh");
      }
      const promise = runNetworkRefresh().catch((error) => {
        // Failed flights must not block retries.
        if (inFlightByRefreshToken.get(key)?.promise === promise) {
          inFlightByRefreshToken.delete(key);
        }
        throw error;
      });
      flight = { promise, refs: 0 };
      inFlightByRefreshToken.set(key, flight);
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

  try {
    if (commitToSession) {
      // Skip commit if this session already moved past the refresh token that
      // keyed the shared flight (a newer refresh committed first).
      if (key) {
        const current = await session.getSessionItem("refresh_token");
        if (current !== key) {
          if (config.isDebugMode) {
            console.debug(
              "refreshTokensSingleFlight: skipping commit; session refresh token changed",
            );
          }
          return tokens;
        }
      }
      await commitTokensToSessionManager(session, tokens);
    }
    return tokens;
  } finally {
    if (key && flight) {
      releaseInFlight(key, flight);
    }
  }
};

/** Test helper — clears in-flight map between cases. */
export const __resetRefreshTokensSingleFlightForTests = (): void => {
  inFlightByRefreshToken.clear();
};
