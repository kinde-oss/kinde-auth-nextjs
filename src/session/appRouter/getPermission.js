import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {config} from '../../config/index';
import {sessionManager} from '../../session/sessionManager';

export const getPermission = (key) => {
  const kindeClient = createKindeServerClient(
    config.grantType,
    config.clientOptions
  );

  try {
    const permission = kindeClient.getPermission(
      sessionManager(cookies()),
      key
    );
    return permission;
  } catch (error) {
    return null;
  }
};
