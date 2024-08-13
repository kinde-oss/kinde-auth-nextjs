import {config} from '../config/index';
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import React from 'react';
/** @type {Record<import('../../types').KindeFlagTypeCode, import('../../types').KindeFlagTypeValue>} */
export const flagDataTypeMap = {
  s: 'string',
  i: 'integer',
  b: 'boolean'
};

const AuthContext = createContext({
  ...config.initialState
});

/**
 *
 * @returns {import('../../types').KindeState}
 */
export const useKindeAuth = () => useContext(AuthContext);

/**
 *
 * @param {children: import('react').ReactNode, options?: {apiPath: string} | undefined} props
 * @returns
 */
export const KindeProvider = ({children}) => {
  const setupUrl = `${config.apiPath}/setup`;

  const [state, setState] = useState({
    ...config.initialState
  });

  const refreshData = useCallback(() => {
    checkSession();
  }, ['checkSession']);

  const checkSession = async () => {
    try {
      const res = await fetch(setupUrl);
      const kindeData = await res.json();

      if (res.ok) {
        setState({...kindeData, isLoading: kindeData.needsRefresh});
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: kindeData.error
        }));
      }
    } catch (error) {
      console.error('Error fetching data from Kinde', error);
    }
  };

  // if you get the user set loading false
  useEffect(() => {
    if (state.needsRefresh || !state.accessToken) {
      checkSession();
    }
  }, [state.error]);

  const {
    accessToken,
    accessTokenEncoded,
    error,
    featureFlags,
    isLoading,
    idToken,
    idTokenEncoded,
    organization,
    permissions,
    user,
    userOrganizations
  } = state;

  const getAccessToken = () => accessToken;
  const getAccessTokenRaw = () => accessTokenEncoded;
  const getAccessTokenEncoded = () => accessTokenEncoded;
  const getToken = () => accessTokenEncoded;
  const getIdToken = () => idToken;
  const getIdTokenRaw = () => idTokenEncoded;
  const getIdTokenEncoded = () => idTokenEncoded;
  const getPermissions = () => permissions;
  const getOrganization = () => organization;
  const getUser = () => user;
  const getUserOrganizations = () => userOrganizations;

  /**
   *
   * @param {string} claim
   * @param {"access_token" | "id_token"} tokenKey
   */
  const getClaim = (claim, tokenKey = 'access_token') => {
    const token =
      tokenKey === 'access_token' ? state.accessToken : state.idToken;
    // @ts-ignore
    return token ? {name: claim, value: token[claim]} : null;
  };

  /**
   *
   * @param {string} code
   * @param {number | string | boolean} defaultValue
   * @param {import('../../types').KindeFlagTypeCode} flagType
   * @returns {import('../../types').KindeFlag}
   */
  const getFlag = (code, defaultValue, flagType) => {
    const flags = featureFlags;
    const flag = flags && flags[code] ? flags[code] : {};

    if (Object.keys(flag).length === 0 && defaultValue == undefined) {
      throw Error(
        `Flag ${code} was not found, and no default value has been provided`
      );
    }

    // @ts-ignore
    if (flagType && flag.t && flagType !== flag.t) {
      throw Error(
        `Flag ${code} is of type ${
          // @ts-ignore
          flagDataTypeMap[flag.t]
        } - requested type ${flagDataTypeMap[flagType]}`
      );
    }
    return {
      // @ts-ignore
      code,
      // @ts-ignore
      type: flagDataTypeMap[flag.t || flagType],
      // @ts-ignore
      value: flag.v == null ? defaultValue : flag.v,
      // @ts-ignore
      is_default: flag.v == null,
      defaultValue: defaultValue
    };
  };

  /**
   *
   * @param {string} code
   * @param {boolean} defaultValue
   * @returns {boolean | undefined | null}
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
   * @returns {string | undefined | null}
   */
  const getStringFlag = (code, defaultValue) => {
    try {
      const flag = getFlag(code, defaultValue, 's');
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
   * @param {number} defaultValue
   * @returns {number | undefined | null}
   */
  const getIntegerFlag = (code, defaultValue) => {
    try {
      const flag = getFlag(code, defaultValue, 'i');
      return flag.value;
    } catch (err) {
      if (config.isDebugMode) {
        console.error(err);
      }
    }
  };

  /**
   *
   * @param {string} key
   * @returns {import('../../types').KindePermission}
   */
  const getPermission = (key) => {
    return {
      isGranted: permissions.permissions.some((p) => p === key),
      orgCode: organization.orgCode
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        accessTokenRaw: accessTokenEncoded,
        accessTokenEncoded,
        idToken,
        idTokenEncoded,
        idTokenRaw: idTokenEncoded,
        getAccessToken,
        getAccessTokenRaw,
        getAccessTokenEncoded,
        getIdToken,
        getIdTokenRaw,
        getIdTokenEncoded,
        getToken,
        getClaim,
        getFlag,
        getIdToken,
        getBooleanFlag,
        getStringFlag,
        getIntegerFlag,
        getOrganization,
        getPermission,
        getPermissions,
        getUser,
        getUserOrganizations,
        refreshData,
        permissions,
        organization,
        userOrganizations,
        error,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
