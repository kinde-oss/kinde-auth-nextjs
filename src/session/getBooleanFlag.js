import {getFlagFactory} from './getFlag';
import {config} from '../config';

/**
 * @callback getBooleanFlag
 * @param {string} code
 * @param {boolean} defaultValue
 * @returns {Promise<boolean | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getBooleanFlag}
 */
export const getBooleanFlagFactory =
  (req, res) => async (code, defaultValue) => {
    try {
      const flag = await getFlagFactory(req, res)(code, defaultValue, 'b');
      return flag.value;
    } catch (err) {
      if (config.isDebugMode) {
        console.error(err);
      }
      return null;
    }
  };
