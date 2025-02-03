import { config } from "../config/index";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { getAccessToken } from "../utils/getAccessToken";
import { redirectOnExpiredToken } from "../utils/redirectOnExpiredToken";

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
export const getAccessTokenFactory = (req, res) => async () => {
  try {
    const accessToken = await getAccessToken(req, res);
    if (config.isDebugMode) {
      console.log(
        "getAccessTokenFactory: running redirectOnExpiredToken check",
      );
    }
    redirectOnExpiredToken(accessToken);
    return jwtDecoder(accessToken);
  } catch (err) {
    if (config.isDebugMode) {
      console.error(err);
    }
    return null;
  }
};
