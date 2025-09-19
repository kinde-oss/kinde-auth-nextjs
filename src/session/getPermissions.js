import { config } from "../config/index";
import { getPermissions } from "@kinde/js-utils";

/**
 * @callback getPermissions
 * @returns {Promise<import('../types').KindePermissions | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getPermissions}
 */
export const getPermissionsFactory = () => async () => {
  try {
    const result = await getPermissions();
    if (!result.permissions || result.permissions.length === 0) {
      return { permissions: [], orgCode: result.orgCode ?? null };
    }
    return result;
  } catch (error) {
    if (config.isDebugMode) {
      console.error("getPermissionsFactory error (js-utils)", error);
    }
    return null;
  }
};
