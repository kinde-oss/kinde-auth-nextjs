import { sessionManager } from "./sessionManager";
import { kindeClient } from "./kindeServerClient";
import { config } from "../config/index";

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
export const getPermissionsFactory = (req, res) => async () => {
  try {
    const permissions = await kindeClient.getPermissions(
      await sessionManager(req, res),
    );

    if (!permissions.permissions) {
      const hasuraPermissions = await kindeClient.getClaimValue(
        await sessionManager(req, res),
        "x-hasura-permissions",
      );

      return {
        permissions: hasuraPermissions,
        orgCode: await kindeClient.getClaimValue(
          await sessionManager(req, res),
          "x-hasura-org-code",
        ),
      };
    }

    return permissions;
  } catch (error) {
    if (config.isDebugMode) {
      console.error(error);
    }
    return null;
  }
};
