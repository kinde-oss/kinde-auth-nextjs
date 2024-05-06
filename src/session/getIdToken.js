import jwtDecode from 'jwt-decode';
import {sessionManager} from './sessionManager';
import {config} from '../config/index';

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
    return jwtDecode(await sessionManager(req, res).getSessionItem('id_token'));
  } catch (err) {
    if (config.isDebugMode) {
      console.error(err);
    }
    return null;
  }
};
