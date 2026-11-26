"use server";

import { sessionManager } from "./sessionManager";
import { refreshTokens } from "../utils/refreshTokens";

/**
 * Server action used by `refreshData()`.
 * Resolves on success; rejects when refresh fails so callers can distinguish.
 */
export async function refreshTokensServerAction(): Promise<void> {
  const session = await sessionManager();
  // Route through single-flight + terminal-only session clear (do not call
  // kindeClient.refreshTokens directly — that bypasses stale handling).
  const ok = await refreshTokens(session);
  if (!ok) {
    throw new Error("Failed to refresh tokens");
  }
}
