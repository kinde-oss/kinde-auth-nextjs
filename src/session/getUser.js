import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';

/**
 * @callback getUser
 * @returns {Promise<import('../../types').KindeUser | null>}
 */
/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getUser}
 */
export const getUserFactory = (req, res) => async () => {
  try {
    // @ts-ignore
    const user = await kindeClient.getUser(sessionManager(req, res));
    return user;
  } catch (error) {
    return null;
  }
};
