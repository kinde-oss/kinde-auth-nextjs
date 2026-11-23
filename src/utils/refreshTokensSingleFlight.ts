import {
  OAuth2CodeExchangeResponse,
  SessionManager,
} from "@kinde-oss/kinde-typescript-sdk";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { validateToken } from "@kinde/jwt-validator";
import { kindeClient } from "../session/kindeServerClient";
import { config } from "../config";
import { isTokenExpired } from "./jwt/validation";

/**
 * In-process single-flight map keyed by the refresh token being exchanged.
 * Concurrent middleware/setup refreshes with the same token share one network
 * call (best-effort; separate serverless isolates still need the SDK's
 * STALE_REFRESH_TOKEN behaviour).
 *
 * The shared call always uses commitToSession=false so waiters are not tied to
 * another request's session manager. Callers that need persistence commit after.
 */
const inFlightByRefreshToken = new Map<
  string,
  Promise<OAuth2CodeExchangeResponse>
>();

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

  if (!key) {
    tokens = await runNetworkRefresh();
  } else {
    const existing = inFlightByRefreshToken.get(key);
    if (existing) {
      if (config.isDebugMode) {
        console.debug(
          "refreshTokensSingleFlight: joining in-flight refresh for session",
        );
      }
      tokens = await existing;
    } else {
      if (config.isDebugMode) {
        console.debug("refreshTokensSingleFlight: starting refresh");
      }

      const flight = runNetworkRefresh().finally(() => {
        if (inFlightByRefreshToken.get(key) === flight) {
          inFlightByRefreshToken.delete(key);
        }
      });

      inFlightByRefreshToken.set(key, flight);
      tokens = await flight;
    }
  }

  if (commitToSession) {
    await commitTokensToSessionManager(session, tokens);
  }

  return tokens;
};

/** Test helper — clears in-flight map between cases. */
export const __resetRefreshTokensSingleFlightForTests = (): void => {
  inFlightByRefreshToken.clear();
};
