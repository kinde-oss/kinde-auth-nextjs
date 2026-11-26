import { validateToken } from "@kinde/jwt-validator";
import { config } from "../config";
import { SessionManager } from "@kinde-oss/kinde-typescript-sdk";
import { refreshTokensSingleFlight } from "./refreshTokensSingleFlight";
import { shouldClearSessionForRefreshError } from "./staleRefreshTokenGuard";
import { shouldDestroySessionManagerForRefreshError } from "./isTerminalRefreshError";

export const refreshTokens = async (
  session: SessionManager,
): Promise<boolean> => {
  let refreshResult;
  try {
    refreshResult = await refreshTokensSingleFlight(session, true);
  } catch (error) {
    if (config.isDebugMode) {
      console.error("refreshTokens", error);
    }
    // Only destroy on confirmed terminal failures (incl. repeat stale).
    // JWKS/network/commit-validation must not wipe a just-refreshed session.
    // Plain OAuth Error: SDK already destroySession'd — skip re-destroy.
    const clearSession = await shouldClearSessionForRefreshError(
      session,
      error,
    );
    if (
      (await shouldDestroySessionManagerForRefreshError(clearSession, error)) &&
      typeof session.destroySession === "function"
    ) {
      try {
        await session.destroySession();
      } catch {
        // Best-effort.
      }
    }
    return false;
  }

  if (!refreshResult) {
    return false;
  }

  try {
    const token = await session.getSessionItem("access_token");

    if (token && typeof token === "string") {
      const validationResult = await validateToken({
        token,
        domain: config.issuerURL,
      });

      return validationResult.valid;
    }
    return false;
  } catch (error) {
    if (config.isDebugMode) {
      console.error("refreshTokens: post-refresh validateToken failed", error);
    }
    // Do not destroy — refresh already succeeded / tokens may be usable.
    return false;
  }
};
