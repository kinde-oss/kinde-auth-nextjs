import {getUserFactory} from './getUser';

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {() => Promise<boolean>}
 */
export const isAuthenticatedFactory = (req, res) => async () => {
  const user = await getUserFactory(req, res)();
  return Boolean(user);
};
