import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {kindeClient} from '../../session/appRouter/kindeServerClient';
import {sessionManager} from '../../session/sessionManager';

export const login = async () => {
  const authUrl = await kindeClient.login(sessionManager(cookies()));

  redirect(authUrl);
};
