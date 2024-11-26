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
      try {
        const refreshSuccess = await kindeClient.refreshTokens(session);
        if (refreshSuccess) {
          const newToken = await session.getSessionItem(tokenKey);
          const isNewTokenValid = await validateToken({token: newToken as string});
          if (isNewTokenValid) {
            return newToken;
          }
        }
        if (config.isDebugMode) {
          console.error('getIdToken: token refresh failed');
        }
      } catch (error) {
        if (config.isDebugMode) {
          console.error('getIdToken: error during token refresh', error);
        }
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
