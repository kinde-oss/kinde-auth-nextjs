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
import { connection } from "next/server";

export default async function (req?: NextApiRequest, res?: NextApiResponse) {
  // This will prevent NextJS generating a static page where this function is called if no other Dynamic APIs are used.
  await connection();
  return {
    refreshTokens: async () => {
      try {
        // this will ALWAYS fail in an RSC as Cookies cannot be modified there.
        // refreshTokens is technically available in an RSC via getKindeServerSession,
        // but it won't work.
        // Maybe we should provide user feedback on this?
        const response = await kindeClient.refreshTokens(
          await sessionManager(req, res)
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
