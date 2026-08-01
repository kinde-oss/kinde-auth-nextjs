import { getUserFactory } from "./getUser";
import { getAccessToken } from "../utils/getAccessToken";
import { config } from "../config/index";

/**
 * Returns a function that checks if the user is authenticated.
 * This function simply returns true/false based on token validity,
 * without triggering redirects. Use middleware for route protection.
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {() => Promise<boolean>}
 */
export const isAuthenticatedFactory = (req, res) => async () => {
  const token = await getAccessToken(req, res);
  const user = await getUserFactory(req, res)();
  return token && Boolean(user);
};
