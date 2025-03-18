import { getUserFactory } from "./getUser";
import { getAccessToken } from "../utils/getAccessToken";
import { isTokenExpired } from "../utils/jwt/validation";
import { redirect } from "next/navigation.js";
import { redirectOnExpiredToken } from "../utils/redirectOnExpiredToken";
import { config } from "../config/index";

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {() => Promise<boolean>}
 */
export const isAuthenticatedFactory = (req, res) => async () => {
  const token = await getAccessToken(req, res);
  if (config.isDebugMode) {
    console.log("isAuthenticatedFactory: running redirectOnExpiredToken check");
  }
  redirectOnExpiredToken(token);
  const user = await getUserFactory(req, res)();
  return token && Boolean(user);
};
