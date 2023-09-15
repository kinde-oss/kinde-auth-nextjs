import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';

export const getPermissionsFactory = (req, res) => async () => {
  try {
    const permissions = await kindeClient.getPermissions(
      sessionManager(req, res)
    );
    return permissions;
  } catch (error) {
    return null;
  }
};
