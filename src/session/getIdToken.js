import { sessionManager } from "./sessionManager";
import { config } from "../config/index";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { getIdToken } from "../utils/getIdToken";
import { redirectOnExpiredToken } from "../utils/redirectOnExpiredToken";

/**
 * @callback getIdToken
 * @returns {Promise<import('../types').KindeIdToken>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @param {boolean} [autoRedirect]
 * @returns {getIdToken}
 */

// @ts-ignore
export const getIdTokenFactory = (req, res, autoRedirect) => async () => {
  try {
    const token = await getIdToken(req, res);
    if (config.isDebugMode) {
      console.log("getIdTokenFactory: running redirectOnExpiredToken check");
    }
    redirectOnExpiredToken(token, autoRedirect);
    return jwtDecoder(token);
  } catch (err) {
    if (config.isDebugMode) {
      console.error(err);
    }
    return null;
  }
};
