import {cookies} from 'next/headers';
import {sessionManager} from '../../session/sessionManager';
import {kindeClient} from './kindeServerClient';

export const getOrganization = async () => {
  try {
    const org = await kindeClient.getOrganization(sessionManager(cookies()));
    return org;
  } catch (error) {
    return null;
  }
};
