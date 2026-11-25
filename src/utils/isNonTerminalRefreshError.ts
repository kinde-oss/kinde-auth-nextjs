/**
 * Refresh failures that should not clear session cookies / destroy the session.
 *
 * - STALE_REFRESH_TOKEN: overlapping refresh race loser (SDK >= 2.17.0). Cookies
 *   may still be valid from a concurrent winner.
 * - Transient transport / parse failures (TypeError, DOMException, AggregateError,
 *   SyntaxError): token endpoint never confirmed a credential rejection, so the
 *   next request should be allowed to retry with existing cookies.
 */
const TRANSIENT_ERROR_NAMES = new Set([
  "TypeError",
  "DOMException",
  "AggregateError",
  "SyntaxError",
]);

export const isNonTerminalRefreshError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { errorCode?: unknown; name?: unknown };

  if (candidate.errorCode === "STALE_REFRESH_TOKEN") {
    return true;
  }

  if (
    typeof candidate.name === "string" &&
    TRANSIENT_ERROR_NAMES.has(candidate.name)
  ) {
    return true;
  }

  // Node/undici network failures are often plain TypeError instances.
  if (error instanceof TypeError) {
    return true;
  }

  if (
    typeof AggregateError !== "undefined" &&
    error instanceof AggregateError
  ) {
    return true;
  }

  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return true;
  }

  if (error instanceof SyntaxError) {
    return true;
  }

  return false;
};
