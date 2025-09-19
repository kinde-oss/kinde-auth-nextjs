import { getUserFactory } from "./getUser";
import { getAccessToken } from "../utils/getAccessToken";
import { redirectOnExpiredToken } from "../utils/redirectOnExpiredToken";
import { config } from "../config/index";
import { isAuthenticated } from "@kinde/js-utils";

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {() => Promise<boolean>}
 */
export const isAuthenticatedFactory = (req, res) => async (options) => {
  const token = await getAccessToken(req, res);
  if (config.isDebugMode) {
    console.log(
      "isAuthenticatedFactory(js-utils): running redirectOnExpiredToken check"
    );
  }
  redirectOnExpiredToken(token);
  // (supports optional refresh via options)
  const auth = await isAuthenticated(options);
  if (!token) return null; // preserve tri-state (null when no token at all)
  if (!auth) return false; // short-circuit: no need to fetch user profile
  const user = await getUserFactory(req, res)();
  return Boolean(user) && auth;
};