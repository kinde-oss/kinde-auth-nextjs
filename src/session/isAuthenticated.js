import { getUserFactory } from "./getUser";
import { getAccessToken } from "../utils/getAccessToken";
import { isTokenExpired } from "../utils/jwt/validation";
import { redirect } from "next/navigation";
import { redirectOnExpiredToken } from "../utils/redirectOnExpiredToken";


/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {() => Promise<boolean>}
 */
export const isAuthenticatedFactory = (req, res) => async () => {
  const token = await getAccessToken(req, res);
  redirectOnExpiredToken(token);
  const user = await getUserFactory(req, res)();
  return token && Boolean(user);
};
