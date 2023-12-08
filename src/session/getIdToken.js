import jwtDecode from 'jwt-decode';
import {sessionManager} from './sessionManager';

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
  return jwtDecode(await sessionManager(req, res).getSessionItem('id_token'));
};
