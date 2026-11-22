/**
 * Refresh failures that should not clear session cookies.
 *
 * With @kinde-oss/kinde-typescript-sdk >= the STALE_REFRESH_TOKEN change,
 * overlapping refreshes that lose the rotation race throw this code instead of
 * calling destroySession(). Cookie/serverless hosts must also avoid emitting
 * Max-Age=0 Set-Cookie for these failures.
 */
export const isNonTerminalRefreshError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { errorCode?: unknown; name?: unknown };
  return candidate.errorCode === "STALE_REFRESH_TOKEN";
};
