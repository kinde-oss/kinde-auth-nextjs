import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';
import {config} from '../config';

/**
 * @callback getClaim
 *  @param {string} claim
 *  @param {"access_token" | "id_token"} [type]
 * @returns {Promise<{name: string, value: string}> | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getClaim}
 */
export const getClaimFactory = (req, res) => async (claim, type) => {
  try {
    const kindeClaim = await kindeClient.getClaim(
      sessionManager(req, res),
      claim,
      type
    );
    return kindeClaim;
  } catch (error) {
    if (config.isDebugMode) {
      console.error(error);
    }
    return null;
  }
};
