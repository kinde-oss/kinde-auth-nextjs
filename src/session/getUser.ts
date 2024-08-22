import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';
import {config} from '../config/index';
import {generateUserObject} from '../utils/generateUserObject';
import {NextApiRequest, NextApiResponse} from 'next';
import {KindeIdToken, KindeUser} from '../../types';
import jwtDecode from 'jwt-decode';

export const getUserFactory =
  (req: NextApiRequest, res: NextApiResponse) =>
  async <T = Record<string, any>>(): Promise<KindeUser<T>> => {
    try {
      const idToken = jwtDecode(
        (await sessionManager(req, res).getSessionItem('id_token')) as string
      ) as KindeIdToken<T>;

      return generateUserObject(idToken);

      const user = await kindeClient.getUser(sessionManager(req, res));
      const userProperties = await kindeClient.getClaimValue(
        sessionManager(req, res),
        'user_properties'
      );
      const phone_number = await kindeClient.getClaimValue(
        sessionManager(req, res),
        'phone_number',
        'id_token'
      );
      const username = await kindeClient.getClaimValue(
        sessionManager(req, res),
        'preferred_username',
        'id_token'
      );
      return generateUserObject(user, userProperties, phone_number, username);
    } catch (error) {
      if (config.isDebugMode) {
        console.debug('getUser', error);
      }
      return null;
    }
  };
