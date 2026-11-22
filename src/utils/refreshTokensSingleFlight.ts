import {
  OAuth2CodeExchangeResponse,
  SessionManager,
} from "@kinde-oss/kinde-typescript-sdk";
import { kindeClient } from "../session/kindeServerClient";
import { config } from "../config";

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

const commitTokensToSessionManager = async (
  session: SessionManager,
  tokens: OAuth2CodeExchangeResponse,
): Promise<void> => {
  await session.setSessionItem("access_token", tokens.access_token);
  await session.setSessionItem("id_token", tokens.id_token);
  await session.setSessionItem("refresh_token", tokens.refresh_token);
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
