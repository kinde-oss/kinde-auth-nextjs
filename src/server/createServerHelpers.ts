import {
  getDecodedToken,
  getRawToken,
  getFlag as jsGetFlag,
  getClaim as jsGetClaim,
  getCurrentOrganization,
  getPermission as jsGetPermission,
  getPermissions as jsGetPermissions,
  getRoles as jsGetRoles,
  getUserOrganizations as jsGetUserOrganizations,
  isAuthenticated as jsIsAuthenticated,
  getEntitlements as jsGetEntitlements,
  StorageKeys,
} from "@kinde/js-utils";
import { withServerStorage } from "./serverStorage";

export interface KindeServerHelpers {
  getAccessToken(): Promise<any | null>;
  getIdToken(): Promise<any | null>;
  getAccessTokenRaw(): Promise<string | null>;
  getIdTokenRaw(): Promise<string | null>;
  getFlag(code: string, _default?: any): Promise<any>;
  getBooleanFlag(code: string, defaultValue: boolean): Promise<boolean>;
  getIntegerFlag(code: string, defaultValue: number): Promise<number>;
  getStringFlag(code: string, defaultValue: string): Promise<string>;
  getClaim(
    claim: string,
    tokenKey?: "accessToken" | "idToken"
  ): Promise<{ name: string; value: string } | null>;
  getOrganization<T = any>(): Promise<T | null>;
  getPermission(key: string): Promise<any | null>;
  getPermissions(): Promise<any[] | null>;
  getRoles(): Promise<any[] | null>;
  getUserOrganizations(): Promise<any[] | null>;
  isAuthenticated(): Promise<boolean>;
  getEntitlements(): Promise<any | null>;
}

/** Internal helper to safely call an async function and swallow errors returning fallback */
const safe = async <T>(
  req: any,
  res: any,
  fn: () => Promise<T>,
  fallback: any = null
): Promise<T | any> => {
  try {
    return await withServerStorage(req, res, fn);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Kinde Server Helpers] Error:", err);
    }
    return fallback;
  }
};

/** Build helpers used by both App & Pages server entrypoints */
export const buildServerHelpers = (
  req?: any,
  res?: any
): KindeServerHelpers => {
  return {
    getAccessToken: () =>
      safe(req, res, () => getDecodedToken(StorageKeys.accessToken)),
    getIdToken: () =>
      safe(req, res, () => getDecodedToken(StorageKeys.idToken)),
    getAccessTokenRaw: () =>
      safe(req, res, () => getRawToken(StorageKeys.accessToken)),
    getIdTokenRaw: () => safe(req, res, () => getRawToken(StorageKeys.idToken)),
    getFlag: (code, _default) =>
      safe(
        req,
        res,
        async () => {
          const v = await jsGetFlag(code);
          return v == null ? _default : v;
        },
        _default
      ),
    getBooleanFlag: (code, defaultValue) =>
      safe(
        req,
        res,
        async () => {
          const v: any = await jsGetFlag(code);
          return typeof v === "boolean" ? v : defaultValue;
        },
        defaultValue
      ),
    getIntegerFlag: (code, defaultValue) =>
      safe(
        req,
        res,
        async () => {
          const v: any = await jsGetFlag(code);
          return typeof v === "number" ? v : defaultValue;
        },
        defaultValue
      ),
    getStringFlag: (code, defaultValue) =>
      safe(
        req,
        res,
        async () => {
          const v: any = await jsGetFlag(code);
          return typeof v === "string" ? v : defaultValue;
        },
        defaultValue
      ),
    getClaim: (claim, tokenKey) =>
      safe(
        req,
        res,
        async () => {
          const normalized = tokenKey === "idToken" ? "idToken" : "accessToken";
          const val: any = await jsGetClaim(claim as any, normalized as any);
          if (val == null) return null;
          return { name: claim, value: String(val) };
        },
        null
      ),
    getOrganization: () => safe(req, res, () => getCurrentOrganization()),
    getPermission: (key) => safe(req, res, () => jsGetPermission(key)),
    getPermissions: () => safe(req, res, () => jsGetPermissions()),
    getRoles: () => safe(req, res, () => jsGetRoles()),
    getUserOrganizations: () => safe(req, res, () => jsGetUserOrganizations()),
    isAuthenticated: () =>
      safe(req, res, async () => (await jsIsAuthenticated()) || false, false),
    getEntitlements: () => safe(req, res, () => jsGetEntitlements()),
  };
};

/**
 * App Router server helpers factory.
 * This is a migration convenience.
 */
export const createAppServerHelpers = (): KindeServerHelpers =>
  buildServerHelpers();

/**
 * Pages Router server helpers factory.
 * Requires req/res so we can hydrate js-utils storage from the router cookies.
 */
export const createPagesServerHelpers = (_req?: any, _res?: any): KindeServerHelpers =>
  buildServerHelpers(_req, _res);
