import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';
/**
 * @callback getRoles
 * @returns {Promise<import('../../types').KindeRoles | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getRoles}
 */
export const getRolesFactory = (req, res) => async () => {
  try {
    const roles = await kindeClient.getClaimValue(
      sessionManager(req, res),
      'roles'
    );
    return roles;
  } catch (error) {
    return null;
  }
};
