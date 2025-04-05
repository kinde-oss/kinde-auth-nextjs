import { useEffect, useState } from "react";
import { flagDataTypeMap } from "./AuthProvider.jsx";
import { config } from "../config/index.js";
import { routes } from "../config/index.js";
import { useSyncState } from "./hooks/use-sync-state.js";

const getRefreshTokensServerAction = async () => {
  try {
    const { refreshTokensServerAction } = await import("../session/refreshTokensServerAction.js");
    return refreshTokensServerAction;
  } catch (error) {
    return null;
  }
};

/**
 *
 * @returns {import('../../types.js').KindeState}
 */
export const useKindeBrowserClient = (
  apiPath = process.env.NEXT_PUBLIC_KINDE_AUTH_API_PATH ||
    process.env.KINDE_AUTH_API_PATH ||
    "/api/auth",
) => {
  const [getState, setState] = useSyncState({
    accessToken: null,
    accessTokenRaw: null,
    error: null,
    featureFlags: [],
    idToken: null,
    idTokenRaw: null,
    isAuthenticated: false,
    isLoading: true,
    organization: null,
    permissions: [],
    user: null,
    userOrganizations: null,
  });

  useEffect(() => {
    fetchKindeState();
  }, []);

  const refreshData = async () => {
    const refreshTokens = await getRefreshTokensServerAction();
    if(refreshTokens) {
      await refreshTokens();
      await fetchKindeState();
    } else {
        console.warn("[Kinde] refreshData is only available in Next.js App Router environments, version 14 or higher.");
    }
  }

  const fetchKindeState = async () => {
    const setupUrl = `${apiPath}/${routes.setup}`;
    const res = await fetch(setupUrl);
    const { message, error, ...kindeData } = await res.json();
    if (!res.ok) {
      setState({
        ...getState(),
        isLoading: false,
        error: `${message}: ${error || "An error occurred"}`,
      });
      return;
    }

    switch (message) {
      case "OK":
        setState({
          ...kindeData,
          isLoading: false,
        });
        break;
      case "NOT_LOGGED_IN":
        setState({
          ...getState(),
          isLoading: false,
        });
        break;
      default:
        setState({
          ...getState(),
          isLoading: false,
          error: `${message}: ${error || "An error occurred"}`,
        });
    }
  };

  /**
   *
   * @param {string} code
   * @param {string | number | boolean} defaultValue
   * @param {import('../../types.js').KindeFlagTypeCode} flagType
   * @returns {import('../../types.js').KindeFlag}
   */
  const getFlag = (code, defaultValue, flagType) => {
    const flags = getState().featureFlags || [];
    const flag = flags && flags[code] ? flags[code] : null;

    if (!flag && defaultValue == undefined) {
      throw Error(
        `Flag ${code} was not found, and no default value has been provided`,
      );
    }

    if (flagType && flag.t && flagType !== flag.t) {
      throw Error(
        `Flag ${code} is of type ${flagDataTypeMap[flag.t]} - requested type ${
          flagDataTypeMap[flagType]
        }`,
      );
    }
    return {
      code,
      type: flagDataTypeMap[flag.t || flagType],
      value: flag.v == null ? defaultValue : flag.v,
      is_default: flag.v == null,
      defaultValue: defaultValue,
    };
  };

  /**
   *
   * @param {string} code
   * @param {boolean} defaultValue
   * @returns {boolean | undefined}
   */
  const getBooleanFlag = (
    code: string,
    defaultValue: boolean,
  ): boolean | undefined => {
    try {
      const flag = getFlag(code, defaultValue, "b");
      return flag.value;
    } catch (err) {
      if (config.isDebugMode) {
        console.error(err);
      }
    }
  };

  /**
   *
   * @param {string} code
   * @param {string} defaultValue
   * @returns {string | undefined}
   */
  const getStringFlag = (
    code: string,
    defaultValue: string,
  ): string | undefined => {
    try {
      const flag = getFlag(code, defaultValue, "s");
      return flag.value;
    } catch (err) {
      if (config.isDebugMode) {
        console.error(err);
      }
      err;
    }
  };

  /**
   *
   * @param {string} code
   * @param {number} defaultValue
   * @returns {number | undefined}
   */
  const getIntegerFlag = (
    code: string,
    defaultValue: number,
  ): number | undefined => {
    try {
      const flag = getFlag(code, defaultValue, "i");
      return flag.value;
    } catch (err) {
      if (config.isDebugMode) {
        console.error(err);
      }
      err;
    }
  };

  /**
   *
   * @param {string} claim
   * @param {"access_token" | "id_token"} tokenKey
   * @returns
   */
  const getClaim = (claim, tokenKey = "access_token") => {
    const token =
      tokenKey === "access_token" ? getState().accessToken : getState().idToken;
    return token ? { name: claim, value: token[claim] } : null;
  };

  /**
   * @returns {import('../../types.js').KindeAccessToken | null}
   */
  const getAccessToken = () => {
    return getState().accessToken;
  };
  /**
   * @returns {string | null}
   */
  const getToken = () => {
    //@ts-ignore
    return getState().accessTokenEncoded;
  };

  /**
   * @returns {string | null}
   */
  const getAccessTokenRaw = () => {
    //@ts-ignore
    return state.accessTokenEncoded;
  };

  /**
   * @returns {string | null}
   */
  const getIdTokenRaw = () => {
    return getState().idTokenRaw;
  };
  /**
   * @returns {import('../../types.js').KindeIdToken | null}
   */
  const getIdToken = () => {
    return getState().idToken;
  };
  /**
   * @returns {import('../../types.js').KindeOrganization | null}
   */
  const getOrganization = () => {
    return getState().organization;
  };
  /**
   * @returns {import('../../types.js').KindePermissions | never[]}
   */
  const getPermissions = () => {
    return getState().permissions;
  };
  /**
   * @returns {import('../../types.js').KindeOrganizations | never[]}
   */
  const getUserOrganizations = () => {
    return getState().userOrganizations;
  };
  /**
   *
   * @param {string} key
   * @returns {import('../../types.js').KindePermission}
   */
  const getPermission = (key) => {
    if (!getState().permissions) return { isGranted: false, orgCode: null };

    return {
      //@ts-ignore
      isGranted: getState().permissions.permissions?.some((p) => p === key),
      orgCode: getState().organization?.orgCode,
    };
  };

  return {
    ...getState(),
    isAuthenticated: !!getState().user,
    getUser: () => getState().user,
    getIdTokenRaw,
    getPermission,
    getBooleanFlag,
    getIntegerFlag,
    getFlag,
    getStringFlag,
    getClaim,
    getAccessToken,
    getToken,
    getAccessTokenRaw,
    getIdToken,
    getOrganization,
    getPermissions,
    getUserOrganizations,
    refreshData,
  };
};
