'use server';

import { kindeClient } from './kindeServerClient';
import { sessionManager } from './sessionManager';

export async function refreshTokensServerAction() {
	const session = await sessionManager();
	await kindeClient.refreshTokens(session);
}
