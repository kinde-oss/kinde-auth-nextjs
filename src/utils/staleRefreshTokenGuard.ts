import { SessionManager } from "@kinde-oss/kinde-typescript-sdk";
import { config } from "../config";
import {
  isStaleRefreshError,
  isTerminalRefreshError,
} from "./isTerminalRefreshError";

/**
 * Bounds STALE_REFRESH_TOKEN retries: a revoked/expired refresh token looks the
 * same as a race loser in SDK 2.17.0.
 *
 * Terminal promotion requires a later, distinct failure for the same refresh
 * token after STALE_TERMINAL_MIN_INTERVAL_MS. That avoids:
 * - client setup retry immediately after REFRESH_IN_PROGRESS_OR_STALE while
 *   winner Set-Cookie has not landed yet
 * - two waiters on one shared failed flight both assessing the same rejection
 */
const recentStaleByRefreshToken = new Map<
  string,
  { firstSeenAt: number; flightId?: string }
>();
const STALE_MEMORY_TTL_MS = 60_000;
/** Min time between first and terminal-promoting stale for the same token. */
export const STALE_TERMINAL_MIN_INTERVAL_MS = 2_000;

/** Shared assessment for one failed in-flight refresh (all waiters reuse). */
const assessmentByFlightId = new Map<
  string,
  { assessment: StaleRefreshAssessment; expiresAt: number }
>();

const pruneStaleMemory = (now: number): void => {
  for (const [token, entry] of recentStaleByRefreshToken) {
    if (now - entry.firstSeenAt > STALE_MEMORY_TTL_MS) {
      recentStaleByRefreshToken.delete(token);
    }
  }
  for (const [flightId, entry] of assessmentByFlightId) {
    if (now > entry.expiresAt) {
      assessmentByFlightId.delete(flightId);
    }
  }
};

export type StaleRefreshAssessment =
  "winner_cookies_present" | "first_stale" | "repeat_stale_terminal";

/**
 * Assess a STALE_REFRESH_TOKEN against the session's current refresh token.
 * When `flightId` is provided, all waiters for that failed flight share one
 * assessment so a single rejection cannot count as first + repeat.
 */
export const assessStaleRefreshFailure = async (
  session: SessionManager,
  failedRefreshToken: string | null,
  flightId?: string | null,
): Promise<StaleRefreshAssessment> => {
  const now = Date.now();
  pruneStaleMemory(now);

  if (flightId) {
    const shared = assessmentByFlightId.get(flightId);
    if (shared && now <= shared.expiresAt) {
      return shared.assessment;
    }
  }

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
    const assessment: StaleRefreshAssessment = "winner_cookies_present";
    if (flightId) {
      assessmentByFlightId.set(flightId, {
        assessment,
        expiresAt: now + STALE_MEMORY_TTL_MS,
      });
    }
    return assessment;
  }

  if (!failedRefreshToken) {
    return "first_stale";
  }

  const prior = recentStaleByRefreshToken.get(failedRefreshToken);
  if (prior) {
    const elapsed = now - prior.firstSeenAt;
    // Same failed flight, or an immediate client retry within the grace window,
    // must not promote to terminal (winner cookies may still be in flight).
    if (
      (flightId && prior.flightId && prior.flightId === flightId) ||
      elapsed < STALE_TERMINAL_MIN_INTERVAL_MS
    ) {
      if (config.isDebugMode) {
        console.debug(
          "staleRefreshTokenGuard: repeat stale within grace window — still non-terminal",
        );
      }
      const assessment: StaleRefreshAssessment = "first_stale";
      if (flightId) {
        assessmentByFlightId.set(flightId, {
          assessment,
          expiresAt: now + STALE_MEMORY_TTL_MS,
        });
      }
      return assessment;
    }

    recentStaleByRefreshToken.delete(failedRefreshToken);
    if (config.isDebugMode) {
      console.debug(
        "staleRefreshTokenGuard: repeat stale after grace window — terminal",
      );
    }
    const assessment: StaleRefreshAssessment = "repeat_stale_terminal";
    if (flightId) {
      assessmentByFlightId.set(flightId, {
        assessment,
        expiresAt: now + STALE_MEMORY_TTL_MS,
      });
    }
    return assessment;
  }

  recentStaleByRefreshToken.set(failedRefreshToken, {
    firstSeenAt: now,
    flightId: flightId ?? undefined,
  });
  const assessment: StaleRefreshAssessment = "first_stale";
  if (flightId) {
    assessmentByFlightId.set(flightId, {
      assessment,
      expiresAt: now + STALE_MEMORY_TTL_MS,
    });
  }
  return assessment;
};

export const __resetStaleRefreshTokenGuardForTests = (): void => {
  recentStaleByRefreshToken.clear();
  assessmentByFlightId.clear();
};

/**
 * Attach a stable flight id to a rejected refresh error so waiters share one
 * stale assessment.
 */
export const tagRefreshErrorWithFlightId = (
  error: unknown,
  flightId: string,
): unknown => {
  if (!error || typeof error !== "object") {
    return error;
  }
  try {
    Object.defineProperty(error, "refreshFlightId", {
      value: flightId,
      enumerable: false,
      configurable: true,
    });
  } catch {
    (error as { refreshFlightId?: string }).refreshFlightId = flightId;
  }
  return error;
};

export const getRefreshErrorFlightId = (error: unknown): string | null => {
  if (!error || typeof error !== "object") {
    return null;
  }
  const id = (error as { refreshFlightId?: unknown }).refreshFlightId;
  return typeof id === "string" && id.length > 0 ? id : null;
};

/**
 * Whether callers should clear cookies / destroy the session for this refresh
 * error. Repeat stale for the same refresh token is treated as terminal only
 * after the grace interval (and once per failed flight).
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
    const assessment = await assessStaleRefreshFailure(
      session,
      token,
      getRefreshErrorFlightId(error),
    );
    return assessment === "repeat_stale_terminal";
  }

  return isTerminalRefreshError(error);
};
