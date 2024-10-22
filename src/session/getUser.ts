import {NextApiRequest, NextApiResponse} from 'next';
import {KindeAccessToken, KindeIdToken, KindeUser} from '../../types';
import {config} from '../config/index';
import {generateUserObject} from '../utils/generateUserObject';
import {sessionManager} from './sessionManager';
import {jwtDecoder} from '@kinde/jwt-decoder';

export const getUserFactory =
  (req: NextApiRequest, res: NextApiResponse) =>
  async <T = Record<string, any>>(): Promise<KindeUser<T>> => {
    try {
      const idToken = jwtDecoder<KindeIdToken>(
        (await (await sessionManager(req, res)).getSessionItem('id_token')) as string
      );

      const accessToken = jwtDecoder<KindeAccessToken>(
        (await (await sessionManager(req, res)).getSessionItem(
          'access_token'
        )) as string
      );
      return generateUserObject(idToken, accessToken) as KindeUser<T>;
    } catch (error) {
      if (config.isDebugMode) {
        console.debug('getUser', error);
      }
      return null;
    }
  };
