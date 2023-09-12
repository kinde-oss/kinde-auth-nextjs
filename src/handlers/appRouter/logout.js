import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {kindeClient} from '../../session/appRouter/kindeServerClient';
import {sessionManager} from '../../session/sessionManager';

export const logout = async () => {
  const authUrl = await kindeClient.logout(sessionManager(cookies()));

  redirect(authUrl);
};
