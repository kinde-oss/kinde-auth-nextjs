import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect
} from 'react';

import {config} from '../config/index';

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
 * @param {string} url
 * @returns {Promise<import('../../types').KindeSetupResponse | undefined>}
 */
const tokenFetcher = async (url) => {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Failed to fetch token');
  }

  if (response.ok) {
    const json = await response.json();
    return json;
  } else if (response.status === 401) {
    throw new Error('Failed to fetch token');
  }
};

/**
 *
 * @param {{children: import('react').ReactNode, options?: {apiPath: string} | undefined} props
 * @returns
 */
export const KindeProvider = ({children, options}) => {
  const [state, setState] = useState({
    ...config.initialState
  });

  // console.log('state', state);
  config.apiPath = options?.apiPath ? options.apiPath : '/api/auth';

  const setupUrl = `${config.apiPath}/setup`;

  // try and get the user (by fetching /api/auth/setup) -> this needs to do the OAuth stuff
  const checkSession = useCallback(async () => {
    try {
      const tokens = await tokenFetcher(setupUrl);

      if (tokens == undefined) return;

      const {
        accessToken,
        accessTokenEncoded,
        featureFlags,
        idToken,
        organization,
        permissions,
        user,
        userOrganizations
      } = tokens;

      const getAccessToken = () => accessToken;
      const getToken = () => accessTokenEncoded;
      const getIdToken = () => idToken;
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
          tokenKey === 'access_token' ? tokens.accessToken : tokens.idToken;
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

        if (flag == {} && defaultValue == undefined) {
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
          console.error(err);
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
          console.error(err);
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
          console.error(err);
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

      setState((previous) => ({
        ...previous,
        accessToken,
        idToken,
        isLoading: false,
        organization,
        permissions,
        user,
        userOrganizations,
        getAccessToken,
        getBooleanFlag,
        getClaim,
        getFlag,
        getIdToken,
        getIntegerFlag,
        getOrganization,
        getPermission,
        getPermissions,
        getStringFlag,
        getToken,
        getUser,
        getUserOrganizations
      }));
    } catch (error) {
      // @ts-ignore
      setState((previous) => ({...previous, isLoading: false, error: error}));
    }
  }, [setupUrl]);

  // if you get the user set loading false
  useEffect(() => {
    const checkLoading = async () => {
      await checkSession();
      setState((previous) => ({
        ...previous,
        isLoading: false
      }));
    };
    if (!state.user) {
      checkLoading();
    }
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
