import {jwtDecoder} from '@kinde/jwt-decoder';
import {KindeAccessToken, KindeIdToken} from '../../types';
import {config} from '../config/index';
import {generateOrganizationObject} from '../utils/generateOrganizationObject';
import {sessionManager} from './sessionManager';
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

    const accessTokenString = await (await sessionManager(req, res)).getSessionItem(
      'access_token'
    );
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
