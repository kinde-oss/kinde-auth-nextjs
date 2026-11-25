/**
 * Confirmed terminal refresh failures — only these should clear cookies /
 * destroy the session.
 *
 * Default is preserve: unknown, transient transport, stale race, and commit
 * validation errors must not log the user out.
 */
const TRANSIENT_ERROR_NAMES = new Set([
  "TypeError",
  "DOMException",
  "AggregateError",
  "SyntaxError",
]);

const isTransientTransportError = (error: object): boolean => {
  const candidate = error as { name?: unknown };

  if (
    typeof candidate.name === "string" &&
    TRANSIENT_ERROR_NAMES.has(candidate.name)
  ) {
    return true;
  }

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

export const isStaleRefreshError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }
  return (error as { errorCode?: unknown }).errorCode === "STALE_REFRESH_TOKEN";
};

export const isInvalidTokenCommitError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }
  return (
    (error as { errorCode?: unknown }).errorCode ===
    "INVALID_TOKEN_MEMORY_COMMIT"
  );
};

/**
 * @deprecated Prefer {@link isTerminalRefreshError} for clear/destroy decisions.
 * Kept for call sites that only need "do not clear" (stale + transient).
 */
export const isNonTerminalRefreshError = (error: unknown): boolean =>
  !isTerminalRefreshError(error);

/**
 * True only when the failure is a confirmed auth-server rejection (or an
 * explicit second stale for the same dead refresh token), not a race/transient.
 */
export const isTerminalRefreshError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  if (isStaleRefreshError(error)) {
    // First-chance stale is non-terminal. Repeat stale for the same refresh
    // token is promoted to terminal by shouldClearSessionForRefreshError.
    return false;
  }

  if (isInvalidTokenCommitError(error)) {
    return false;
  }

  if (isTransientTransportError(error)) {
    return false;
  }

  const candidate = error as { errorCode?: unknown; name?: unknown };

  if (candidate.errorCode === "FAILED_TOKENS_REFRESH_ATTEMPT") {
    return true;
  }

  // SDK OAuth error path after destroySession: `throw new Error(message)`.
  if (error instanceof Error && error.name === "Error") {
    return true;
  }

  return false;
};
