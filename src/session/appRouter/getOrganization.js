import {cookies} from 'next/headers';
import {sessionManager} from '../../session/sessionManager';
import {kindeClient} from './kindeServerClient';

export const getOrganization = () => {
  try {
    const org = kindeClient.getOrganization(sessionManager(cookies()));
    return org;
  } catch (error) {
    return null;
  }
};
