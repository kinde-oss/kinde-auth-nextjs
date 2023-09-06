import {createKindeServerClient} from '@kinde-oss/kinde-typescript-sdk';
import {cookies} from 'next/headers';
import {config} from '../../config/index';
import {sessionManager} from '../../session/sessionManager';

export const getOrganization = () => {
  const kindeClient = createKindeServerClient(
    config.grantType,
    config.clientOptions
  );

  try {
    const org = kindeClient.getOrganization(sessionManager(cookies()));
    return org;
  } catch (error) {
    return null;
  }
};
