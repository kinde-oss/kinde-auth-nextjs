import { sessionManager } from "./sessionManager";
import { kindeClient } from "./kindeServerClient";
import { config } from "../config/index";

/**
 * @callback getPermission
 *  @param {string} name
 * @returns {Promise<import('../../types').KindePermission | null>}
 */

/**
 *
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {getPermission}
 */
export const getPermissionFactory = (req, res) => async (name) => {
  try {
    const permission = await kindeClient.getPermission(
      await sessionManager(req, res),
      name,
    );

    if (!permission.isGranted) {
      const hasuraPermissions = await kindeClient.getClaimValue(
        await sessionManager(req, res),
        "x-hasura-permissions",
      );
      if (hasuraPermissions.includes(name)) {
        return { isGranted: true, orgCode: permission.orgCode };
      }
    }
    return permission;
  } catch (error) {
    if (config.isDebugMode) {
      console.error(error);
    }
    return null;
  }
};
