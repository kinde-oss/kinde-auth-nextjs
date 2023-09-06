import {cookies} from 'next/headers';
import {sessionManager} from '../../session/sessionManager';
import {kindeClient} from './kindeServerClient';

export const getPermissions = () => {
  try {
    const permissions = kindeClient.getPermissions(sessionManager(cookies()));
    return permissions;
  } catch (error) {
    return null;
  }
};
