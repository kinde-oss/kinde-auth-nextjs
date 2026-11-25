import { validateToken } from "@kinde/jwt-validator";
import { config } from "../config";
import { SessionManager } from "@kinde-oss/kinde-typescript-sdk";
import { refreshTokensSingleFlight } from "./refreshTokensSingleFlight";
import { isNonTerminalRefreshError } from "./isNonTerminalRefreshError";

export const refreshTokens = async (
  session: SessionManager,
): Promise<boolean> => {
  try {
    const refreshResult = await refreshTokensSingleFlight(session, true);
    if (!refreshResult) {
      return false;
    }

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
      console.error("refreshTokens", error);
    }
    // Terminal failures: ensure session is cleared. Non-terminal (stale refresh
    // race or transient transport) must leave cookies intact.
    if (
      !isNonTerminalRefreshError(error) &&
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
};
