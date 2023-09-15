import {sessionManager} from './sessionManager';

export const getAccessTokenFactory = (req, res) => async () => {
  return await sessionManager(req, res).getSessionItem('access_token_payload');
};
