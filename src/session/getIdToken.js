import {sessionManager} from './sessionManager';
import {config} from '../config/index';
import {jwtDecoder} from '@kinde/jwt-decoder';

/**
 * @callback getIdToken
 * @returns {Promise<import('../../types').KindeIdToken>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getIdToken}
 */

// @ts-ignore
export const getIdTokenFactory = (req, res) => async () => {
  try {
    return jwtDecoder(
      await (await sessionManager(req, res)).getSessionItem('id_token')
    );
  } catch (err) {
    if (config.isDebugMode) {
      console.error(err);
    }
    return null;
  }
};
