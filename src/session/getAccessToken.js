import {sessionManager} from './sessionManager';

/**
 *
 * @param {Request} [req]
 * @param {Response} [res]
 *
 */
export const getAccessTokenFactory = (req, res) => async () => {
  return await sessionManager(req, res).getSessionItem('access_token_payload');
};
