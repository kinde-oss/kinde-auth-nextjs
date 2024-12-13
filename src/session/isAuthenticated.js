import { getUserFactory } from "./getUser";
import { getAccessToken } from "../utils/getAccessToken";

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {() => Promise<boolean>}
 */
export const isAuthenticatedFactory = (req, res) => async () => {
  const token = await getAccessToken(req, res);
  console.log('isAuthenticatedFactory token', token)
  const user = await getUserFactory(req, res)();
  return token && Boolean(user);
};
