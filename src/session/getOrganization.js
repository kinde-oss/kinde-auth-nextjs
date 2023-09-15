import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';

export const getOrganizationFactory = (req, res) => async () => {
  try {
    const organization = await kindeClient.getOrganization(
      sessionManager(req, res)
    );
    return organization;
  } catch (error) {
    return null;
  }
};
