import {cookies} from 'next/headers';
import {sessionManager} from '../../session/sessionManager';
import {kindeClient} from './kindeServerClient';

export const getPermission = async (key) => {
  try {
    const permission = await kindeClient.getPermission(
      sessionManager(cookies()),
      key
    );
    return permission;
  } catch (error) {
    return null;
  }
};
