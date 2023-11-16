import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';
/**
 * @callback getOrganization
 * @returns {Promise<import('../../types').KindeOrganization | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getOrganization}
 */
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
