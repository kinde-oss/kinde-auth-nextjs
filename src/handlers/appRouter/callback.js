import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {config} from '../../config/index';
import {sessionManager} from '../../session/sessionManager';

export const callback = async (request) => {
  const kindeClient = createKindeServerClient(
    config.grantType,
    config.clientOptions
  );

  await kindeClient.handleRedirectToApp(
    sessionManager(cookies()),
    new URL(request.url)
  );

  redirect(config.postLoginRedirectURL);
};
