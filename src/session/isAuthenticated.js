import { removeTrailingSlash } from '../utils/removeTrailingSlash';
import { getUserFactory } from './getUser';
import jwtDecode from 'jwt-decode';

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {() => Promise<boolean>}
 */
export const isAuthenticatedFactory = (req, res) => async () => {
  const user = await getUserFactory(req, res)();
  
  if (!user) {
    return false;
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    if (!decoded) {
      return false;
    }

    const { exp, iss } = decoded;
    const currentTime = Math.floor(Date.now() / 1000);

    // Check expiration
    if (exp < currentTime) {
      return false;
    }

    // Verify issuer
    if (iss !== removeTrailingSlash(process.env.KINDE_ISSUER_URL)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Token decoding failed:', error);
    return false;
  }
};