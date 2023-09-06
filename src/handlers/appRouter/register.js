import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {kindeClient} from '../../session/appRouter/kindeServerClient';
import {sessionManager} from '../../session/sessionManager';

export const register = async () => {
  const authUrl = await kindeClient.register(sessionManager(cookies()));

  redirect(authUrl);
};
