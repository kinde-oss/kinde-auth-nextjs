import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';
import {config} from '../config/index';
import {generateUserObject} from '../utils/generateUserObject';

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
    const userProperties = await kindeClient.getClaimValue(
      sessionManager(req, res),
      'user_properties'
    );
    const phone_number = await kindeClient.getClaimValue(
      sessionManager(req, res),
      'phone_number',
      'id_token'
    );
    const username = await kindeClient.getClaimValue(
      sessionManager(req, res),
      'preferred_username',
      'id_token'
    );
    return generateUserObject(user, userProperties, phone_number, username);
  } catch (error) {
    if (config.isDebugMode) {
      console.debug('getUser', error);
    }
    return null;
  }
};
