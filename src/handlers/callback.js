import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {config} from '../config/index';
import {kindeClient} from '../session/appRouter/kindeServerClient';
import {sessionManager} from '../session/sessionManager';

export const callback = async (routerClient) => {
  await routerClient.kindeClient.handleRedirectToApp(
    sessionManager(cookies()),
    routerClient.getUrl()
  );

  routerClient.redirect(config.postLoginRedirectURL);
};
