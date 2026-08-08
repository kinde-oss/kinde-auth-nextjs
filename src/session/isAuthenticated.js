import { getUserFactory } from "./getUser";
import { getAccessTokenFactory } from "./getAccessToken";
import { config } from "../config/index";

/**
 * Returns a function that checks if the user is authenticated.
 * This function simply returns true/false based on token validity,
 * without triggering redirects. Use middleware for route protection.
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @param {boolean} [autoRedirect] - If true, will redirect on expired token (default: false for isAuthenticated)
 * @returns {() => Promise<boolean>}
 */
export const isAuthenticatedFactory = (req, res, autoRedirect = false) => async () => {
  const getAccessTokenFn = getAccessTokenFactory(req, res, autoRedirect);
  const token = await getAccessTokenFn();
  
  // Return false early if no token or token is expired
  if (!token) {
    return false;
  }
  
  const user = await getUserFactory(req, res, autoRedirect)();
  return Boolean(user);
};
