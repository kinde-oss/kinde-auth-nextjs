import {jwtDecoder} from '@kinde/jwt-decoder';
import {KindeAccessToken, KindeIdToken} from '../../types';
import {config} from '../config/index';
import {generateOrganizationObject} from '../utils/generateOrganizationObject';
import {sessionManager} from './sessionManager';
import { getAccessToken } from '../utils/getAccessToken';
/**
 * @callback getOrganization
 * @returns {Promise<import('../../types').KindeOrganization | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getOrganization}
 */
export const getOrganizationFactory = (req, res) => async () => {
  try {
    const idTokenString = await (await sessionManager(req, res)).getSessionItem(
      'id_token'
    );
    if (!idTokenString) {
      throw new Error('ID token is missing');
    }
    const idToken = jwtDecoder<KindeIdToken>(idTokenString as string);

    const accessToken = await getAccessToken(req, res) as string;
    const decodedToken = jwtDecoder<KindeAccessToken>(accessToken) 

    return generateOrganizationObject(idToken, decodedToken);
  } catch (error) {
    if (config.isDebugMode) {
      console.error(error);
    }
    return null;
  }
};
