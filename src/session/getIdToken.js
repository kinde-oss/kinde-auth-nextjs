import { sessionManager } from "./sessionManager";
import { config } from "../config/index";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { getIdToken } from "../utils/getIdToken";
import { redirectOnExpiredToken } from "../utils/redirectOnExpiredToken";

/**
 * @callback getIdToken
 * @returns {Promise<import('../../types').KindeIdToken>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getIdToken}
 */

// @ts-ignore
export const getIdTokenFactory = (req, res) => async () => {
  try {
    const token = await getIdToken(req, res);
    redirectOnExpiredToken(token);
    return jwtDecoder(token);
  } catch (err) {
    if (config.isDebugMode) {
      console.error(err);
    }
    return null;
  }
};
