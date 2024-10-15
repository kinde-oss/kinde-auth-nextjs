import jwtDecode from 'jwt-decode';
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
    const idToken = jwtDecode(
      (await sessionManager(req, res).getSessionItem('id_token')) as string
    ) as KindeIdToken;

    const accessToken = jwtDecode(
      (await sessionManager(req, res).getSessionItem('access_token')) as string
    ) as KindeAccessToken;

    return generateOrganizationObject(idToken, accessToken);
  } catch (error) {
    if (config.isDebugMode) {
      console.error(error);
    }
    return null;
  }
};
