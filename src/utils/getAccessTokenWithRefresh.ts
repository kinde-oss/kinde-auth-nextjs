import {kindeClient} from '../session/kindeServerClient';
import {sessionManager} from '../session/sessionManager';
import {isTokenValid} from './isTokenValid';

export const getAccessTokenWithRefresh = async (
  req,
  res,
  useRefresh = true
): Promise<string | null> => {
  const accessToken = (await (
    await sessionManager(req, res)
  ).getSessionItem('access_token')) as string | null;

  const validToken = isTokenValid(accessToken);

  if (!validToken && useRefresh) {
    await kindeClient.refreshTokens(await sessionManager(req, res));

    await getAccessTokenWithRefresh(req, res, false);
  }

  if (validToken) {
    return accessToken;
  }
  return null;
};
