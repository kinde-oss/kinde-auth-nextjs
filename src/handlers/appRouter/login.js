import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {config} from '../../config/index';
import {sessionManager} from '../../session/sessionManager';

export const login = async (request) => {
  const kindeClient = createKindeServerClient(
    config.grantType,
    config.clientOptions
  );

  const authUrl = await kindeClient.login(sessionManager(cookies()));

  redirect(authUrl);
};
