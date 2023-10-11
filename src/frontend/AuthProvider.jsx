import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect
} from 'react';

import {config} from '../config/index';
export const flagDataTypeMap = {
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
 * @property {string | null} family_name - User's family name
 * @property {string | null} given_name - User's given name
 * @property {string | null} picture - URL to user's picture
 * @property {string | null} email - User's email
 * @property {string | null} id - User's Kinde ID
 */

/**
 * @callback getClaim
 * @param {string} claim - Property in a token object
 * @param {"access_token" | "id_token"} [tokenKey] - Determines which token to get the claim from
 * @returns {{name: string, value: string} | null}
 */

/**
 * @callback getFlag
 * @param {string} code - The flag's code on Kinde
 * @param {string | number | boolean} defaultValue - Default value if the flag cannot be found
 * @param {"b" | "i" | "s"} flagType - The flag's type
 * @returns {{code: string, type: string, value: string | number | boolean, is_default: boolean}}
 */

/**
 * @callback getBooleanFlag
 * @param {string} code - The flag's code on Kinde
 * @param {boolean} defaultValue - Fallback boolean value if the flag cannot be found
 * @returns {boolean}
 */

/**
 * @callback getIntegerFlag
 * @param {string} code - The flag's code on Kinde
 * @param {number} defaultValue - Fallback integer value if the flag cannot be found
 * @returns {number}
 */

/**
 * @callback getStringFlag
 * @param {string} code - The flag's code on Kinde
 * @param {string} defaultValue - Fallback string value if the flag cannot be found
 * @returns {string}
 */

/**
 * @callback getPermission
 * @param {string} key - The permission's key on Kinde
 * @return {{isGranted: boolean, orgCode: string}}
 */

/**
 * @typedef {Object} State
 * @property {string | null} accessToken - Kinde access token
 * @property {string | null} [error]
 * @property {boolean | null} isAuthenticated
 * @property {boolean | null} isLoading
 * @property {string | null} organization - The organization that the current user is logged in to
 * @property {[string] | null} permissions - The current user's permissions
 * @property {KindeUser | null} user - Kinde user
 * @property {[string] | null} userOrganizations - Organizations that the current user belongs to
 * @property {getBooleanFlag} getBooleanFlag
 * @property {getClaim} getClaim
 * @property {getFlag} getFlag
 * @property {getIntegerFlag} getIntegerFlag
 * @property {getPermission} getPermission
 * @property {getStringFlag} getStringFlag
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
 *
 * @param {{children: React.ReactNode}} props
 * @returns {React.Provider<React.ProviderProps<children: React.ReactNode>>}
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
