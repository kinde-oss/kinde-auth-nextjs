import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';

/**
 * @callback getPermissions
 * @returns {Promise<import('../../types').KindePermissions | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getPermissions}
 */
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
