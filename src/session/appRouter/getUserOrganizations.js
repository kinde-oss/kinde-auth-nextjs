import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {config} from '../../config/index';
import {sessionManager} from '../../session/sessionManager';

export const getUserOrganizations = (req) => {
  const kindeClient = createKindeServerClient(
    config.grantType,
    config.clientOptions
  );

  try {
    const userOrgs = kindeClient.getUserOrganizations(
      sessionManager(cookies())
    );
    return userOrgs;
  } catch (error) {
    return null;
  }
};
