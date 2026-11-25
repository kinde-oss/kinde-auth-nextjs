"use server";

import { sessionManager } from "./sessionManager";
import { refreshTokens } from "../utils/refreshTokens";

export async function refreshTokensServerAction() {
  const session = await sessionManager();
  // Route through single-flight + terminal-only session clear (do not call
  // kindeClient.refreshTokens directly — that bypasses stale handling).
  await refreshTokens(session);
}
