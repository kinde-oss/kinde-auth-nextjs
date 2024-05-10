import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';
/**
 * @callback getUserOrganizations
 * @returns {Promise<import('../../types').KindeOrganizations | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getUserOrganizations}
 */
export const getUserOrganizationsFactory = (req, res) => async () => {
  try {
    const userOrgs = await kindeClient.getUserOrganizations(
      sessionManager(req, res)
    );
    const orgNames = await kindeClient.getClaimValue(
      sessionManager(req, res),
      'organizations',
      'id_token'
    );

    return {
      orgCodes: userOrgs.orgCodes,
      orgs: orgNames.map((org) => ({
        code: org?.id,
        name: org?.name
      }))
    };
  } catch (error) {
    return null;
  }
};
