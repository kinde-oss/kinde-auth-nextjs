import {cookies} from 'next/headers';
import {sessionManager} from '../../session/sessionManager';
import {kindeClient} from './kindeServerClient';

export const getPermission = (key) => {
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
