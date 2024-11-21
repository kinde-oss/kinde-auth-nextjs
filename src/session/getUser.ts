import {NextApiRequest, NextApiResponse} from 'next';
import {KindeAccessToken, KindeIdToken, KindeUser} from '../../types';
import {config} from '../config/index';
import {generateUserObject} from '../utils/generateUserObject';
import {sessionManager} from './sessionManager';
import {jwtDecoder} from '@kinde/jwt-decoder';
import { getAccessToken } from '../utils/getAccessToken';
import { getIdToken } from '../utils/getIdToken';

export const getUserFactory =
  (req: NextApiRequest, res: NextApiResponse) =>
  async <T = Record<string, any>>(): Promise<KindeUser<T>> => {
    try {
      const rawToken = await getIdToken(req, res);
      const idToken = jwtDecoder<KindeIdToken>(rawToken);

      const accessToken = await getAccessToken(req, res);
      const decodedToken = jwtDecoder<KindeAccessToken>(accessToken) 

      return generateUserObject(idToken, decodedToken) as KindeUser<T>;
    } catch (error) {
      if (config.isDebugMode) {
        console.debug('getUser', error);
      }
      return null;
    }
  };
