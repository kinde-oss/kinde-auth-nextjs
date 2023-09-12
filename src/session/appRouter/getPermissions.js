import {cookies} from 'next/headers';
import {sessionManager} from '../../session/sessionManager';
import {kindeClient} from './kindeServerClient';

export const getPermissions = async () => {
  try {
    const permissions = await kindeClient.getPermissions(
      sessionManager(cookies())
    );
    return permissions;
  } catch (error) {
    return null;
  }
};
