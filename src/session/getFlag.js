import {sessionManager} from './sessionManager';
import {kindeClient} from './kindeServerClient';

/**
 * @callback getFlag
 * @param {string} code
 * @param {boolean | number | string} defaultValue
 * @param {import('../../types').KindeFlagTypeCode} flagType
 * @returns {Promise<import('../../types').KindeFlag | {value: boolean | number | string}>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getFlag}
 */
export const getFlagFactory =
  (req, res) => async (code, defaultValue, flagType) => {
    try {
      const flag = await kindeClient.getFlag(
        await sessionManager(req, res),
        code,
        defaultValue,
        flagType
      );

      return flag;
    } catch (error) {
      // @ts-ignore
      if (error.message.includes('no default value has been provided')) {
        throw error;
      }
      return {value: defaultValue};
    }
  };
