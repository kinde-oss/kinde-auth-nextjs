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

// New App Router Server Wrapper
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
import { cookies } from "next/headers";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { getSplitCookies } from "../../utils/cookies/getSplitSerializedCookies";
import { getStandardCookieOptions } from "../../utils/cookies/getStandardCookieOptions";
import { config } from "../../config";

// NOTE: new js-utils implementations
export const createAppRouterSession = () => {
  return {
    // Legacy compatibility surface (async getters returning null on failure)
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
      // js-utils getFlag handles all types; default value logic preserved externally if needed
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
            console.error("refreshTokens(js-utils): failed", result.error);
          return null;
        }
        const access = result.accessToken || (result as any).access_token;
        const id = result.idToken || (result as any).id_token;
        const refresh = result.refreshToken || (result as any).refresh_token;

        const cookieStore = await cookies();

        // Determine persistence (default true) from access token payload if present
        let persistent = true;
        try {
          const decoded: any = jwtDecoder(access);
          if (decoded?.ksp?.persistent === false) persistent = false;
        } catch {}

        const splitAccess = getSplitCookies("access_token", access);
        const splitId = getSplitCookies("id_token", id);
        const standardOpts = getStandardCookieOptions();
        if (!persistent) delete standardOpts.maxAge;

        [...splitAccess, ...splitId].forEach((c) => {
          const opts = { ...c.options };
          if (!persistent) delete opts.maxAge;
          cookieStore.set(c.name, c.value, opts);
        });
        if (refresh) {
          cookieStore.set("refresh_token", refresh, standardOpts);
        }
        return {
          access_token: access,
          id_token: id,
          refresh_token: refresh,
        } as any;
      } catch (e) {
        if (config.isDebugMode)
          console.error("refreshTokens(js-utils) error", e);
        return null;
      }
    },
  } as any;
};
