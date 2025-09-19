import { config } from "../config/index";
import { getPermission } from "@kinde/js-utils";

/**
 * @callback getPermission
 *  @param {string} name
 * @returns {Promise<import('../types').KindePermission | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getPermission}
 */
export const getPermissionFactory = () => async (name) => {
  try {
    const permission = await getPermission(name);
    return { isGranted: permission.isGranted, orgCode: permission.orgCode };
  } catch (error) {
    if (config.isDebugMode) {
      console.error("getPermissionFactory error (js-utils)", error);
    }
    return null;
  }
};
