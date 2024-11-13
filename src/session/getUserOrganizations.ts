import {jwtDecoder} from '@kinde/jwt-decoder';
import {NextApiRequest, NextApiResponse} from 'next';
import {KindeAccessToken, KindeIdToken, KindeOrganizations} from '../../types';
import {config} from '../config/index';
import {generateUserOrganizationsObject} from '../utils/generateUserOrganizationsObject';
import {sessionManager} from './sessionManager';

export const getUserOrganizationsFactory =
  (req?: NextApiRequest, res?: NextApiResponse) =>
  async (): Promise<KindeOrganizations | null> => {
    try {
      const session = await sessionManager(req, res);
      const idTokenString = await session.getSessionItem('id_token');
      if (!idTokenString) {
        throw new Error('ID token is missing');
      }
      const idToken = jwtDecoder<KindeIdToken>(idTokenString as string);

      const accessTokenString = await session.getSessionItem('access_token');
      if (!accessTokenString) {
        throw new Error('Access token is missing');
      }
      const accessToken = jwtDecoder<KindeAccessToken>(
        accessTokenString as string
      );

      return generateUserOrganizationsObject(idToken, accessToken);
    } catch (error) {
      if (config.isDebugMode) {
        console.debug('getUserOrganization error:', error);
      }
      return null;
    }
  };
