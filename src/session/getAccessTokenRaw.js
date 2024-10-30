import {sessionManager} from './sessionManager';

/**
 * @callback getAccessTokenRaw
 * @returns {Promise<string>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 *
 * @returns {getAccessTokenRaw}
 */
// @ts-ignore
export const getAccessTokenRawFactory = (req, res) => async () => {
  return await (await sessionManager(req, res)).getSessionItem('access_token');
};
