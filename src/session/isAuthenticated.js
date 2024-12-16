import { getUserFactory } from "./getUser";
import { getAccessToken } from "../utils/getAccessToken";
import { isTokenExpired } from "../utils/jwt/validation";
import { redirect } from "next/navigation";


/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {() => Promise<boolean>}
 */
export const isAuthenticatedFactory = (req, res) => async () => {
  const token = await getAccessToken(req, res);
  console.log('isAuthenticatedFactory: token', token)
  if(isTokenExpired(token)) {
    console.log('isAuthenticatedFactory: token is expired, redirecting to login')
    redirect('/api/auth/login')
  }
  const user = await getUserFactory(req, res)();
  return token && Boolean(user);
};
