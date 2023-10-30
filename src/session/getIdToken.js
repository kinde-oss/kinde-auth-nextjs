import {sessionManager} from './sessionManager';

/**
 *
 * @param {Request} [req]
 * @param {Response} [res]
 *
 */
export const getIdTokenFactory = (req, res) => async () => {
  return await sessionManager(req, res).getSessionItem('id_token_payload');
};
