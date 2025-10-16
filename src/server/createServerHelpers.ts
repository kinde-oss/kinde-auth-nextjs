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

/** Shape of the server helper utilities returned by the factory */
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
    tokenKey?: "accessToken" | "idToken",
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
  fn: () => Promise<T>,
  fallback: any = null,
): Promise<T | any> => {
  try {
    return await fn();
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Kinde Server Helpers] Error:', err);
    }
    return fallback;
  }
};

/** Build helpers used by both App & Pages server entrypoints */
export const buildServerHelpers = (): KindeServerHelpers => {
  return {
    getAccessToken: () => safe(() => getDecodedToken(StorageKeys.accessToken)),
    getIdToken: () => safe(() => getDecodedToken(StorageKeys.idToken)),
    getAccessTokenRaw: () => safe(() => getRawToken(StorageKeys.accessToken)),
    getIdTokenRaw: () => safe(() => getRawToken(StorageKeys.idToken)),
    getFlag: (code, _default) =>
      safe(async () => {
        const v = await jsGetFlag(code);
        return v == null ? _default : v;
      }, _default),
    getBooleanFlag: (code, defaultValue) =>
      safe(async () => {
        const v: any = await jsGetFlag(code);
        return typeof v === "boolean" ? v : defaultValue;
      }, defaultValue),
    getIntegerFlag: (code, defaultValue) =>
      safe(async () => {
        const v: any = await jsGetFlag(code);
        return typeof v === "number" ? v : defaultValue;
      }, defaultValue),
    getStringFlag: (code, defaultValue) =>
      safe(async () => {
        const v: any = await jsGetFlag(code);
        return typeof v === "string" ? v : defaultValue;
      }, defaultValue),
    getClaim: (claim, tokenKey) =>
      safe(async () => {
        const normalized = tokenKey === "idToken" ? "idToken" : "accessToken";
        const val: any = await jsGetClaim(claim as any, normalized as any);
        if (val == null) return null;
        return { name: claim, value: String(val) };
      }, null),
    getOrganization: () => safe(() => getCurrentOrganization()),
    getPermission: (key) => safe(() => jsGetPermission(key)),
    getPermissions: () => safe(() => jsGetPermissions()),
    getRoles: () => safe(() => jsGetRoles()),
    getUserOrganizations: () => safe(() => jsGetUserOrganizations()),
    isAuthenticated: () =>
      safe(async () => (await jsIsAuthenticated()) || false, false),
    getEntitlements: () => safe(() => jsGetEntitlements()),
  };
};

/**
 * App Router server helpers factory.
 * Prefer direct js-utils imports for tree-shaking; this is a migration convenience.
 */
export const createAppServerHelpers = (): KindeServerHelpers =>
  buildServerHelpers();

/**
 * Pages Router server helpers factory (accepts req/res for potential future use).
 * Currently req/res are unused; kept to align with legacy signatures and allow evolution.
 */
export const createPagesServerHelpers = (
  _req?: any,
  _res?: any,
): KindeServerHelpers => buildServerHelpers();
