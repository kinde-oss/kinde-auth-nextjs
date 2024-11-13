import {jwtDecoder} from '@kinde/jwt-decoder';
import {KindeAccessToken, KindeIdToken, KindeOrganization} from '../../types';
import {config} from '../config/index';
import {generateOrganizationObject} from '../utils/generateOrganizationObject';
import {sessionManager} from './sessionManager';
import {NextApiRequest, NextApiResponse} from 'next';

export const getOrganizationFactory =
  (
    req?: NextApiRequest,
    res?: NextApiResponse
  ): (() => Promise<KindeOrganization | null>) =>
  async () => {
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

      return generateOrganizationObject(idToken, accessToken);
    } catch (error) {
      if (config.isDebugMode) {
        console.error(error);
      }
      return null;
    }
  };
