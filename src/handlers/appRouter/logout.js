import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {config} from '../../config/index';
import {sessionManager} from '../../session/sessionManager';

export const logout = () => {
  const kindeClient = createKindeServerClient(
    config.grantType,
    config.clientOptions
  );

  const authUrl = kindeClient.logout(sessionManager(cookies()));

  redirect(authUrl);
};
