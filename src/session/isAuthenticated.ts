import {getUserFactory} from './getUser';
import {getAccessTokenWithRefresh} from '../utils/getAccessTokenWithRefresh';

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
