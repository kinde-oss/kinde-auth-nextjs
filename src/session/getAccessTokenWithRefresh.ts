import {jwtDecoder} from '@kinde/jwt-decoder';
import {KindeAccessToken} from '../../types';
import {kindeClient} from '../session/kindeServerClient';
import {sessionManager} from '../session/sessionManager';
import {isTokenValid} from '../utils/isTokenValid';

export const getAccessTokenWithRefresh = async (
  req,
  res,
  forceRefresh = false
): Promise<KindeAccessToken | null> => {
  const accessToken = (await (
    await sessionManager(req, res)
  ).getSessionItem('access_token')) as string | null;

  const refreshToken = (await (
    await sessionManager(req, res)
  ).getSessionItem('refresh_token')) as string | null;

  // no access token and no refresh token - error
  if (!accessToken && !refreshToken) {
    throw new Error('No access token and no refresh token');
  }

  // token expired but no refresh token - error
  const validToken = isTokenValid(accessToken);
  const decodedToken = jwtDecoder(accessToken) as KindeAccessToken;

  if (!validToken && !refreshToken) {
    throw new Error(
      'The access token expired and a refresh token is not available. The user will need to sign in again.'
    );
  }

  if (forceRefresh && !refreshToken) {
    throw new Error(
      'A refresh token is required to refresh the access token, but none is present.'
    );
  }

  // token expired and refresh token - refresh token
  if (
    (decodedToken.exp * 1000 < Date.now() && refreshToken) ||
    (forceRefresh && refreshToken)
  ) {
    const {access_token} = await kindeClient.refreshTokens(
      await sessionManager(req, res)
    );

    return jwtDecoder(access_token) as KindeAccessToken;
  }

  if (!validToken) {
    return null;
  }

  return decodedToken;
};
