import {isTokenValid} from '../utils/pageRouter/isTokenValid';
import {getUserFactory} from './getUser';
import {sessionManager} from './sessionManager';

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {() => Promise<boolean>}
 */
export const isAuthenticatedFactory = (req, res) => async () => {
  const accessToken = await sessionManager(req, res).getSessionItem(
    'access_token'
  );

  const validToken = isTokenValid(accessToken);

  const user = await getUserFactory(req, res)();
  return validToken && Boolean(user);
};
