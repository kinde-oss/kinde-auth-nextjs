import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';

export const getPermissionFactory = (req, res) => async (name) => {
  try {
    const permission = await kindeClient.getPermission(
      sessionManager(req, res),
      name
    );
    return permission;
  } catch (error) {
    return null;
  }
};
