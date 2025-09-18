import { config } from "../config/index";
import { getRoles as jsGetRoles } from "@kinde/js-utils";
/**
 * @callback getRoles
 * @returns {Promise<import('../types').KindeRoles | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getRoles}
 */
export const getRolesFactory = () => async () => {
  try {
    const roles = await jsGetRoles();
    if (!roles || roles.length === 0) return null;
    return roles;
  } catch (error) {
    if (config.isDebugMode) {
      console.error("getRolesFactory error (js-utils)", error);
    }
    return null;
  }
};
