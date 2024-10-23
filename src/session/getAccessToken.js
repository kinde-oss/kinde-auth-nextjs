import {sessionManager} from './sessionManager';
import {config} from '../config/index';
import {jwtDecoder} from '@kinde/jwt-decoder';

/**
 * @callback getAccessToken
 * @returns {Promise<import('../../types.js').KindeAccessToken | undefined>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 *
 * @returns {getAccessToken}
 */
// @ts-ignore
export const getAccessTokenFactory = (req, res) => async () => {
  try {
    return jwtDecoder(
      await (await sessionManager(req, res)).getSessionItem('access_token')
    );
  } catch (err) {
    if (config.isDebugMode) {
      console.error(err);
    }
    return null;
  }
};
