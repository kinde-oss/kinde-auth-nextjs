import {isTokenValid} from '../utils/pageRouter/isTokenValid';
import {getUserFactory} from './getUser';
import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {() => Promise<boolean>}
 */
export const isAuthenticatedFactory = (req, res) => async () => {
  await getAccessTokenWithRefresh(req, res);

  const user = await getUserFactory(req, res)();
  return Boolean(user);
};

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
