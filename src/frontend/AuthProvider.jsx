import React, {
  useContext,
  useState,
  createContext,
  useCallback,
  useEffect
} from 'react';

import {config} from '../config/index';

const flagDataTypeMap = {
  s: 'string',
  i: 'integer',
  b: 'boolean'
};

const handleError = () => {
  throw new Error(
    'Oops! Seems like you forgot to wrap your app in <KindeProvider>.'
  );
};
/**
 * @typedef {Object} KindeUser
 * @property {string | null} family_name
 * @property {string | null} given_name
 * @property {string | null} picture
 * @property {string | null} email
 * @property {string | null} id
 */

/**
 * @typdef {function(code, defaultValue)} getBooleanFlag
 * @function getBooleanFlag
 * @returns {boolean}
 */

/**
 * @typedef {Object} State
 * @property {string | null} accessToken
 * @property {string | null} [error]
 * @property {boolean | null} isAuthenticated
 * @property {boolean | null} isLoading
 * @property {boolean | null} organizations
 * @property {boolean | null} permissions
 * @property {KindeUser | null} user
 * @property {boolean | null} userOrganizations
 * @property {getBooleanFlag} getBooleanFlag
 * @property {function} getClaim
 * @property {GetFlag} getFlag
 * @property {function} getIntegerFlag
 * @property {function} getPermission
 * @property {function} getStringFlag
 */

/**
 * @typedef {Object} KindeFlag
 * @property {string} code
 * @property {string} type
 * @property {string | boolean | number} value
 * @property {boolean} is_default
 */

/**
 * @returns {React.Context<State>}
 */
const AuthContext = createContext({
  ...config.initialState,
  user: handleError,
  isLoading: handleError,
  getToken: handleError
});

/**
 *
 * @returns {State}
 */
export const useKindeAuth = () => useContext(AuthContext);

const tokenFetcher = async (url) => {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new RequestError(0);
  }

  if (response.ok) {
    const json = await response.json();
    return json;
  } else if (response.status === 401) {
    return;
  }
};

/**
 * @typedef {object} Props
 * @property {React.ReactNode} children
 */

/**
 *
 * @param {Props} props
 * @returns {React.Provider<React.ProviderProps<Props>>}
 */
export const KindeProvider = ({children}) => {
  const [state, setState] = useState({
    ...config.initialState,
    getToken: () => null
  });

  const setupUrl = `${config.apiPath}/setup`;

  // try and get the user (by fetching /api/auth/setup) -> this needs to do the OAuth stuff
  const checkSession = useCallback(async () => {
    try {
      const tokens = await tokenFetcher(setupUrl);

      const {
        user,
        permissions,
        organization,
        userOrganizations,
        featureFlags,
        accessToken
      } = tokens;

      /**
       *
       * @param {string} claim
       * @param {string} tokenKey
       * @returns {string | Object}
       */
      const getClaim = (claim, tokenKey = 'access_token') => {
        const token =
          tokenKey === 'access_token' ? tokens.access_token : tokens.id_token;
        return token ? {name: claim, value: token[claim]} : null;
      };

      const getFlag = (code, defaultValue, flagType) => {
        const flags = featureFlags;
        const flag = flags && flags[code] ? flags[code] : {};

        if (flag == {} && defaultValue == undefined) {
          throw Error(
            `Flag ${code} was not found, and no default value has been provided`
          );
        }

        if (flagType && flag.t && flagType !== flag.t) {
          throw Error(
            `Flag ${code} is of type ${
              flagDataTypeMap[flag.t]
            } - requested type ${flagDataTypeMap[flagType]}`
          );
        }
        return {
          code,
          type: flagDataTypeMap[flag.t || flagType],
          value: flag.v == null ? defaultValue : flag.v,
          is_default: flag.v == null
        };
      };

      const getBooleanFlag = (code, defaultValue) => {
        try {
          const flag = getFlag(code, defaultValue, 'b');
          return flag.value;
        } catch (err) {
          console.error(err);
        }
      };

      const getStringFlag = (code, defaultValue) => {
        try {
          const flag = getFlag(code, defaultValue, 's');
          return flag.value;
        } catch (err) {
          console.error(err);
        }
      };

      const getIntegerFlag = (code, defaultValue) => {
        try {
          const flag = getFlag(code, defaultValue, 'i');
          return flag.value;
        } catch (err) {
          console.error(err);
        }
      };

      const getPermission = (key) => {
        return {
          isGranted: permissions.some((p) => p === key),
          orgCode: organization
        };
      };

      setState((previous) => ({
        ...previous,
        user,
        accessToken,
        permissions,
        organization,
        userOrganizations,
        getClaim,
        getFlag,
        getBooleanFlag,
        getStringFlag,
        getIntegerFlag,
        getPermission,
        error: undefined
      }));
    } catch (error) {
      setState((previous) => ({...previous, isLoading: false, error}));
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

  // provide this stuff to the rest of your app
  const {
    user,
    accessToken,
    getClaim,
    getFlag,
    getBooleanFlag,
    getStringFlag,
    getIntegerFlag,
    getPermission,
    permissions,
    organization,
    userOrganizations,
    error,
    isLoading
  } = state;

  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        accessToken,
        getClaim,
        getFlag,
        getBooleanFlag,
        getStringFlag,
        getIntegerFlag,
        getPermission,
        permissions,
        organization,
        userOrganizations,
        isLoading,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
