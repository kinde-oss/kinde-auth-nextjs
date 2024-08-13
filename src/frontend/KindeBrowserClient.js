import {useEffect, useState} from 'react';
import {flagDataTypeMap} from './AuthProvider.jsx';
import {config} from '../config/index.js';

/**
 *
 * @returns {import('../../types.js').KindeState}
 */
export const useKindeBrowserClient = (
  apiPath = process.env.NEXT_PUBLIC_KINDE_AUTH_API_PATH ||
    process.env.KINDE_AUTH_API_PATH ||
    '/api/auth'
) => {
  const [state, setState] = useState({
    ...config.initialState
  });

  const refreshData = async () => {
    const setupUrl = `${apiPath}/setup`;
    try {
      const res = await fetch(setupUrl);

      if (res.ok) {
        const kindeData = await res.json();
        setState({...kindeData, isLoading: false});
      } else if (res.status === 204) {
        setState((prev) => ({...prev, isLoading: false}));
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: res.statusText || 'An error occurred'
        }));
      }
    } catch (error) {
      console.error('Error fetching data from Kinde', error);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  /**
   *
   * @param {string} code
   * @param {string | number | boolean} defaultValue
   * @param {import('../../types.js').KindeFlagTypeCode} flagType
   * @returns {import('../../types.js').KindeFlag}
   */
  const getFlag = (code, defaultValue, flagType) => {
    // @ts-ignore
    const flags = state.featureFlags || [];
    // @ts-ignore
    const flag = flags && flags[code] ? flags[code] : {};

    if (flag == {} && defaultValue == undefined) {
      throw Error(
        `Flag ${code} was not found, and no default value has been provided`
      );
    }

    if (flagType && flag.t && flagType !== flag.t) {
      throw Error(
        // @ts-ignore
        `Flag ${code} is of type ${flagDataTypeMap[flag.t]} - requested type ${
          flagDataTypeMap[flagType]
        }`
      );
    }
    return {
      code,
      // @ts-ignore
      type: flagDataTypeMap[flag.t || flagType],
      value: flag.v == null ? defaultValue : flag.v,
      is_default: flag.v == null,
      defaultValue: defaultValue
    };
  };

  /**
   *
   * @param {string} code
   * @param {boolean} defaultValue
   * @returns {boolean | undefined}
   */
  const getBooleanFlag = (code, defaultValue) => {
    try {
      const flag = getFlag(code, defaultValue, 'b');
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
  const getStringFlag = (code, defaultValue) => {
    try {
      const flag = getFlag(code, defaultValue, 's');
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
  const getIntegerFlag = (code, defaultValue) => {
    try {
      const flag = getFlag(code, defaultValue, 'i');
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
  const getClaim = (claim, tokenKey = 'access_token') => {
    const token =
      tokenKey === 'access_token' ? state.accessToken : state.idToken;
    return token ? {name: claim, value: token[claim]} : null;
  };

  /**
   * @returns {import('../../types.js').KindeAccessToken | null}
   */
  const getAccessToken = () => {
    return state.accessToken;
  };
  /**
   * @returns {string | null}
   */
  const getToken = () => {
    return state.accessTokenEncoded;
  };

  /**
   * @returns {string | null}
   */
  const getAccessTokenRaw = () => {
    return state.accessTokenEncoded;
  };

  /**
   * @returns {string | null}
   */
  const getIdTokenRaw = () => {
    return state.idTokenRaw;
  };
  /**
   * @returns {import('../../types.js').KindeIdToken | null}
   */
  const getIdToken = () => {
    return state.idToken;
  };
  /**
   * @returns {import('../../types.js').KindeOrganization | null}
   */
  const getOrganization = () => {
    return state.organization;
  };
  /**
   * @returns {import('../../types.js').KindePermissions | never[]}
   */
  const getPermissions = () => {
    return state.permissions;
  };
  /**
   * @returns {import('../../types.js').KindeOrganizations | never[]}
   */
  const getUserOrganizations = () => {
    return state.userOrganizations;
  };
  /**
   *
   * @param {string} key
   * @returns {import('../../types.js').KindePermission}
   */
  const getPermission = (key) => {
    if (!state.permissions) return {isGranted: false, orgCode: null};

    return {
      isGranted: state.permissions.permissions?.some((p) => p === key),
      orgCode: state.organization?.orgCode
    };
  };

  return {
    ...state,
    isAuthenticated: !!state.user,
    getUser: () => state.user,
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
    refreshData
  };
};
