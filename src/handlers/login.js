import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
// import {kindeClient} from '../session/appRouter/kindeServerClient';
import {sessionManager} from '../session/sessionManager';

export const login = async (routerClient) => {
  const authUrl = await routerClient.kindeClient.login(
    sessionManager(cookies())
  );

  console.log('Look here', authUrl);

  routerClient.redirect(authUrl);
  // redirect(authUrl);
};
