import {getFlagFactory} from './getFlag';
import {config} from '../config/index';

/**
 * @callback getIntegerFlag
 * @param {string} code
 * @param {number} defaultValue
 * @returns {Promise<number | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getIntegerFlag}
 */
export const getIntegerFlagFactory =
  (req, res) => async (code, defaultValue) => {
    try {
      const flag = await getFlagFactory(req, res)(code, defaultValue, 'i');
      return flag.value;
    } catch (err) {
      if (config.isDebugMode) {
        console.error(err);
      }
      return null;
    }
  };
