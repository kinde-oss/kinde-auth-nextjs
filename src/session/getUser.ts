import jwtDecode from 'jwt-decode';
import {NextApiRequest, NextApiResponse} from 'next';
import {KindeAccessToken, KindeIdToken, KindeUser} from '../../types';
import {config} from '../config/index';
import {generateUserObject} from '../utils/generateUserObject';
import {sessionManager} from './sessionManager';

export const getUserFactory =
  (req: NextApiRequest, res: NextApiResponse) =>
  async <T = Record<string, any>>(): Promise<KindeUser<T>> => {
    try {
      const idToken = jwtDecode(
        (await sessionManager(req, res).getSessionItem('id_token')) as string
      ) as KindeIdToken;

      const accessToken = jwtDecode(
        (await sessionManager(req, res).getSessionItem(
          'access_token'
        )) as string
      ) as KindeAccessToken;
      return generateUserObject(idToken, accessToken) as KindeUser<T>;
    } catch (error) {
      if (config.isDebugMode) {
        console.debug('getUser', error);
      }
      return null;
    }
  };
