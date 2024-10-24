import {config} from '../config/index';
import {jwtDecoder} from '@kinde/jwt-decoder';
import {getAccessTokenWithRefresh} from '../utils/getAccessTokenWithRefresh';
import {NextApiRequest, NextApiResponse} from 'next';
/**
 * @callback getAccessToken
 * @returns {Promise<import('../../types.js').KindeAccessToken | undefined>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 *
 * @returns {getAccessToken}
 */
// @ts-ignore
export const getAccessTokenFactory =
  (req: NextApiRequest, res: NextApiResponse) => async () => {
    try {
      return jwtDecoder(await getAccessTokenWithRefresh(req, res));
    } catch (err) {
      if (config.isDebugMode) {
        console.error(err);
      }
      return null;
    }
  };
