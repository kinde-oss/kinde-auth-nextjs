import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';

export const getUserOrganizationsFactory = (req, res) => async () => {
  try {
    const userOrgs = await kindeClient.getUserOrganizations(
      sessionManager(req, res)
    );
    return userOrgs;
  } catch (error) {
    return null;
  }
};
