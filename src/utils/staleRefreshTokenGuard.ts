import { SessionManager } from "@kinde-oss/kinde-typescript-sdk";
import { config } from "../config";
import {
  isStaleRefreshError,
  isTerminalRefreshError,
} from "./isTerminalRefreshError";

/**
 * Bounds STALE_REFRESH_TOKEN retries: a revoked/expired refresh token looks the
 * same as a race loser in SDK 2.17.0. If the same refresh token fails stale
 * twice in this process, treat it as terminal so public/setup paths stop
 * hammering the token endpoint.
 */
const recentStaleByRefreshToken = new Map<string, number>();
const STALE_MEMORY_TTL_MS = 60_000;

const pruneStaleMemory = (now: number): void => {
  for (const [token, seenAt] of recentStaleByRefreshToken) {
    if (now - seenAt > STALE_MEMORY_TTL_MS) {
      recentStaleByRefreshToken.delete(token);
    }
  }
};

export type StaleRefreshAssessment =
  "winner_cookies_present" | "first_stale" | "repeat_stale_terminal";

/**
 * Assess a STALE_REFRESH_TOKEN against the session's current refresh token.
 */
export const assessStaleRefreshFailure = async (
  session: SessionManager,
  failedRefreshToken: string | null,
): Promise<StaleRefreshAssessment> => {
  const now = Date.now();
  pruneStaleMemory(now);

  const current = await session.getSessionItem("refresh_token");
  if (
    failedRefreshToken &&
    typeof current === "string" &&
    current.length > 0 &&
    current !== failedRefreshToken
  ) {
    recentStaleByRefreshToken.delete(failedRefreshToken);
    if (config.isDebugMode) {
      console.debug(
        "staleRefreshTokenGuard: session refresh token changed (winner cookies)",
      );
    }
    return "winner_cookies_present";
  }

  if (!failedRefreshToken) {
    return "first_stale";
  }

  if (recentStaleByRefreshToken.has(failedRefreshToken)) {
    recentStaleByRefreshToken.delete(failedRefreshToken);
    if (config.isDebugMode) {
      console.debug(
        "staleRefreshTokenGuard: repeat stale for same refresh token — terminal",
      );
    }
    return "repeat_stale_terminal";
  }

  recentStaleByRefreshToken.set(failedRefreshToken, now);
  return "first_stale";
};

export const __resetStaleRefreshTokenGuardForTests = (): void => {
  recentStaleByRefreshToken.clear();
};

/**
 * Whether callers should clear cookies / destroy the session for this refresh
 * error. Repeat stale for the same refresh token is treated as terminal.
 */
export const shouldClearSessionForRefreshError = async (
  session: SessionManager,
  error: unknown,
  failedRefreshToken?: string | null,
): Promise<boolean> => {
  if (isStaleRefreshError(error)) {
    let token = failedRefreshToken ?? null;
    if (token == null) {
      const current = await session.getSessionItem("refresh_token");
      token = typeof current === "string" ? current : null;
    }
    const assessment = await assessStaleRefreshFailure(session, token);
    return assessment === "repeat_stale_terminal";
  }

  return isTerminalRefreshError(error);
};
