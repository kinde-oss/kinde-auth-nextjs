import jwtDecode from 'jwt-decode';
import {sessionManager} from './sessionManager';
import {config} from '../config/index';

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
    return jwtDecode(
      await sessionManager(req, res).getSessionItem('access_token')
    );
  } catch (err) {
    if (config.isDebugMode) {
      console.error(err);
    }
    return null;
  }
};
