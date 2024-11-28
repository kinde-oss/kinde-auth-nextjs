import { getFlagFactory } from "./getFlag";
import { config } from "../config/index";
/**
 * @callback getStringFlag
 * @param {string} code
 * @param {string} defaultValue
 * @returns {Promise<string | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getStringFlag}
 */
export const getStringFlagFactory =
  (req, res) => async (code, defaultValue) => {
    try {
      const flag = await getFlagFactory(req, res)(code, defaultValue, "s");
      return flag.value;
    } catch (err) {
      if (config.isDebugMode) {
        console.error(err);
      }
      return null;
    }
  };
