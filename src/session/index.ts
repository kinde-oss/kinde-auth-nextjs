import { getAccessTokenFactory } from "./getAccessToken";
import { getBooleanFlagFactory } from "./getBooleanFlag";
import { getFlagFactory } from "./getFlag";
import { getIdTokenFactory } from "./getIdToken";
import { getIntegerFlagFactory } from "./getIntegerFlag";
import { getOrganizationFactory } from "./getOrganization";
import { getPermissionFactory } from "./getPermission";
import { getPermissionsFactory } from "./getPermissions";
import { getStringFlagFactory } from "./getStringFlag";
import { getUserFactory } from "./getUser";
import { getUserOrganizationsFactory } from "./getUserOrganizations";
import { isAuthenticatedFactory } from "./isAuthenticated";
import { getAccessTokenRawFactory } from "./getAccessTokenRaw";
import { getIdTokenRawFactory } from "./getIdTokenRaw";
import { kindeClient } from "./kindeServerClient";
import { sessionManager } from "./sessionManager";
import { getRolesFactory } from "./getRoles";
import { getClaimFactory } from "./getClaim";
import { config } from "../config/index";
import { NextApiRequest, NextApiResponse } from "next";

export default function (req?: NextApiRequest, res?: NextApiResponse) {
  return {
    /**
     * This method is designed to work exclusively with the Pages Router in Next.js.
     * It is not compatible with the App Router.
     *
     * App Router users should use the `refreshData` method in `useKindeBrowserClient` instead.
     */
    refreshTokens: async () => {
      try {
        const response = await kindeClient.refreshTokens(
          await sessionManager(req, res),
        );
        return response;
      } catch (error) {
        if (config.isDebugMode) {
          console.error(error);
        }
        return null;
      }
    },
    getAccessToken: getAccessTokenFactory(req, res),
    getBooleanFlag: getBooleanFlagFactory(req, res),
    getFlag: getFlagFactory(req, res),
    getIdToken: getIdTokenFactory(req, res),
    getIdTokenRaw: getIdTokenRawFactory(req, res),
    getAccessTokenRaw: getAccessTokenRawFactory(req, res),
    getIntegerFlag: getIntegerFlagFactory(req, res),
    getOrganization: getOrganizationFactory(req, res),
    getPermission: getPermissionFactory(req, res),
    getPermissions: getPermissionsFactory(req, res),
    getStringFlag: getStringFlagFactory(req, res),
    getUser: getUserFactory(req, res),
    getUserOrganizations: getUserOrganizationsFactory(req, res),
    isAuthenticated: isAuthenticatedFactory(req, res),
    getRoles: getRolesFactory(req, res),
    getClaim: getClaimFactory(req, res),
  };
}
