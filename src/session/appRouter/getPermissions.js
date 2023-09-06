import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {config} from '../../config/index';
import {sessionManager} from '../../session/sessionManager';

export const getPermissions = () => {
  const kindeClient = createKindeServerClient(
    config.grantType,
    config.clientOptions
  );

  try {
    const permissions = kindeClient.getPermissions(sessionManager(cookies()));
    return permissions;
  } catch (error) {
    return null;
  }
};
