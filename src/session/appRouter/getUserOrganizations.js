import {cookies} from 'next/headers';
import {sessionManager} from '../../session/sessionManager';
import {kindeClient} from './kindeServerClient';

export const getUserOrganizations = async (req) => {
  try {
    const userOrgs = await kindeClient.getUserOrganizations(
      sessionManager(cookies())
    );
    return userOrgs;
  } catch (error) {
    return null;
  }
};
