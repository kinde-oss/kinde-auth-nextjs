export { default as getKindeServerSession } from "../../session";
export { withAuth } from "../../authMiddleware/authMiddleware";
export { createKindeManagementAPIClient } from "../../api-client";
export { default as handleAuth } from "../../handlers/auth";
export { protectApi, protectPage } from "../../handlers/protect";
export {
  LoginLink,
  CreateOrgLink,
  LogoutLink,
  RegisterLink,
  PortalLink,
} from "../../components";
export * from "../../types";

// New Pages Router Server Wrapper
import getKindeServerSession from "../../session";
import {
  getDecodedToken,
  getRawToken,
  getFlag as jsUtilsGetFlag,
  getClaim as jsUtilsGetClaim,
  getCurrentOrganization,
  getPermission as jsUtilsGetPermission,
  getPermissions as jsUtilsGetPermissions,
  getRoles as jsUtilsGetRoles,
  getUserOrganizations as jsUtilsGetUserOrganizations,
  isAuthenticated as jsUtilsIsAuthenticated,
  getEntitlements as jsUtilsGetEntitlements,
  refreshToken,
  RefreshType,
} from "@kinde/js-utils";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { getSplitCookies } from "../../utils/cookies/getSplitSerializedCookies";
import { getStandardCookieOptions } from "../../utils/cookies/getStandardCookieOptions";
import { config } from "../../config";
import * as cookie from "cookie";

export const createPagesRouterSession = (req?: any, res?: any) => {
  const legacy = getKindeServerSession(req, res);
  return {
    getAccessToken: async () => {
      try {
        return (await getDecodedToken("accessToken")) || null;
      } catch {
        return null;
      }
    },
    getIdToken: async () => {
      try {
        return (await getDecodedToken("idToken")) || null;
      } catch {
        return null;
      }
    },
    getAccessTokenRaw: async () => {
      try {
        return (await getRawToken("accessToken")) || null;
      } catch {
        return null;
      }
    },
    getIdTokenRaw: async () => {
      try {
        return (await getRawToken("idToken")) || null;
      } catch {
        return null;
      }
    },
    getFlag: async (code: string, _default: any, flagType: string) => {
      try {
        const val = await jsUtilsGetFlag(code);
        return val == null ? _default : val;
      } catch {
        return _default;
      }
    },
    getBooleanFlag: async (code: string, defaultValue: boolean) => {
      const v: any = await jsUtilsGetFlag(code);
      return typeof v === "boolean" ? v : defaultValue;
    },
    getIntegerFlag: async (code: string, defaultValue: number) => {
      const v: any = await jsUtilsGetFlag(code);
      return typeof v === "number" ? v : defaultValue;
    },
    getStringFlag: async (code: string, defaultValue: string) => {
      const v: any = await jsUtilsGetFlag(code);
      return typeof v === "string" ? v : defaultValue;
    },
    getClaim: async (claim: string, tokenKey?: "access_token" | "id_token") => {
      try {
        const tokenType = tokenKey === "id_token" ? "idToken" : "accessToken";
        const val: any = await jsUtilsGetClaim(claim as any, tokenType as any);
        if (val == null) return null;
        return { name: claim, value: String(val) } as any;
      } catch {
        return null;
      }
    },
    getOrganization: async <T>() => {
      try {
        return (await getCurrentOrganization()) as any as T;
      } catch {
        return null;
      }
    },
    getPermission: async (key: string) => {
      try {
        return (await jsUtilsGetPermission(key)) as any;
      } catch {
        return null;
      }
    },
    getPermissions: async () => {
      try {
        return (await jsUtilsGetPermissions()) as any;
      } catch {
        return null;
      }
    },
    getRoles: async () => {
      try {
        return (await jsUtilsGetRoles()) as any;
      } catch {
        return null;
      }
    },
    getUserOrganizations: async () => {
      try {
        return (await jsUtilsGetUserOrganizations()) as any;
      } catch {
        return null;
      }
    },
    isAuthenticated: async () => {
      try {
        return (await jsUtilsIsAuthenticated()) || false;
      } catch {
        return false;
      }
    },
    getEntitlements: async () => {
      try {
        return (await jsUtilsGetEntitlements()) as any;
      } catch {
        return null;
      }
    },
    refreshTokens: async () => {
      try {
        const domain = config.issuerURL;
        const clientId = config.clientID;
        const result = await refreshToken({
          domain,
          clientId,
          refreshType: RefreshType.refreshToken,
        });
        if (!result.success) {
          if (config.isDebugMode)
            console.error(
              "pages refreshTokens(js-utils): failed",
              result.error
            );
          return null;
        }
        const access =
          (result as any).access_token || (result as any).accessToken;
        const id = (result as any).id_token || (result as any).idToken;
        const refresh =
          (result as any).refresh_token || (result as any).refreshToken;

        // Determine persistence
        let persistent = true;
        try {
          const decoded: any = jwtDecoder(access);
          if (decoded?.ksp?.persistent === false) persistent = false;
        } catch {}

        // Build new cookies
        const splitAccess = getSplitCookies("access_token", access);
        const splitId = getSplitCookies("id_token", id);
        const standardOpts = getStandardCookieOptions();
        if (!persistent) delete standardOpts.maxAge;

        let existing = res?.getHeader("Set-Cookie") || [];
        if (!Array.isArray(existing)) existing = [existing.toString()];

        const serialize = (c: { name: string; value: string; options: any }) =>
          cookie.serialize(c.name, c.value, c.options);
        const newCookies = [
          ...existing.filter(
            (c: string) =>
              !c.startsWith("access_token") &&
              !c.startsWith("id_token") &&
              !c.startsWith("refresh_token")
          ),
          ...splitAccess.map((c) => {
            const opts = { ...c.options };
            if (!persistent) delete opts.maxAge;
            return serialize({ ...c, options: opts });
          }),
          ...splitId.map((c) => {
            const opts = { ...c.options };
            if (!persistent) delete opts.maxAge;
            return serialize({ ...c, options: opts });
          }),
          (() => {
            const opts: any = { ...standardOpts };
            if (typeof opts.expires === "number") delete opts.expires;
            return cookie.serialize("refresh_token", refresh, opts);
          })(),
        ];
        res?.setHeader("Set-Cookie", newCookies);
        return {
          access_token: access,
          id_token: id,
          refresh_token: refresh,
        } as any;
      } catch (e) {
        if (config.isDebugMode)
          console.error("pages refreshTokens(js-utils) error", e);
        return null;
      }
    },
  } as any;
};
