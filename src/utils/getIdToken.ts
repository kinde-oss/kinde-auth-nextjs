import {config} from '../config';
import {sessionManager} from '../session/sessionManager';
import {NextApiRequest, NextApiResponse} from 'next';
import {validateToken} from './validateToken';
import {kindeClient} from '../session/kindeServerClient';

export const getIdToken = async (req: NextApiRequest, res: NextApiResponse) => {
  const tokenKey = 'id_token';
  try {
    const session = await sessionManager(req, res);
    const token = await session.getSessionItem(tokenKey);

    if (!token || typeof token !== 'string') {
      if (config.isDebugMode) {
        console.error('getIdToken: invalid token or token is missing');
      }
      return null;
    }

    const isTokenValid = await validateToken({
      token
    });

    if (!isTokenValid) {
      if (await kindeClient.refreshTokens(session)) {
        return await session.getSessionItem(tokenKey);
      }

      if (config.isDebugMode) {
        console.error('getIdToken: invalid token');
      }
      return null;
    }

    return token;
  } catch (error) {
    if (config.isDebugMode) {
      console.error('getIdToken', error);
    }
    return null;
  }
};
