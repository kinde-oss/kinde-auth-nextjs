import {sessionManager} from './sessionManager';

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
  return await sessionManager(req, res).getSessionItem('access_token_payload');
};
