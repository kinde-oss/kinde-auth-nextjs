import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {config} from '../../config/index';
import {kindeClient} from '../../session/appRouter/kindeServerClient';
import {sessionManager} from '../../session/sessionManager';

export const callback = async (request) => {
  await kindeClient.handleRedirectToApp(
    sessionManager(cookies()),
    new URL(request.url)
  );

  redirect(config.postLoginRedirectURL);
};
