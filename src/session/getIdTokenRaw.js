import {sessionManager} from './sessionManager';

/**
 * @callback getIdTokenRaw
 * @returns {Promise<string>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getIdTokenRaw}
 */

// @ts-ignore
export const getIdTokenRawFactory = (req, res) => async () => {
  return await (await sessionManager(req, res)).getSessionItem('id_token');
};
