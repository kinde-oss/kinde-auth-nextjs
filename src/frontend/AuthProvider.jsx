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
 * @typedef {Object} User
 * @property {string} id
 * @property {string | null} name
 * @property {string | null} email
 * @property {string | null} given_name
 * @property {string | null} family_name
 * @property {string | null} updated_at
 * @property {string | null} picture
 */

/**
 * @typedef {Object} State
 * @property {User} user
 * @property {boolean} isLoading
 * @property {boolean} isAuthenticated
 * @property {string=} error
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
 * Use auth context.
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

export const KindeProvider = ({children}) => {
  const [state, setState] = useState({
    ...config.initialState,
    getToken: () => null
  });

  const setupUrl = '/api/auth/setup';

  // try and get the user (by fetching /api/auth/setup) -> this needs to do the OAuth stuff
  const checkSession = useCallback(async () => {
    try {
      const tokens = await tokenFetcher(setupUrl);

      const user = {
        id: tokens.id_token.sub,
        name: tokens.id_token.name,
        given_name: tokens.id_token.given_name,
        family_name: tokens.id_token.family_name,
        updated_at: tokens.id_token.updated_at,
        email: tokens.id_token.email,
        picture: tokens.id_token.picture
      };

      const getClaim = (claim, tokenKey = 'access_token') => {
        const token =
          tokenKey === 'access_token' ? tokens.access_token : tokens.id_token;
        return token ? {name: claim, value: token[claim]} : null;
      };

      const getClaimValue = (claim, tokenKey = 'access_token') => {
        const obj = getClaim(claim, tokenKey);
        return obj && obj.value;
      };

      const getFlag = (code, defaultValue, flagType) => {
        const flags = getClaimValue('feature_flags');
        const flag = flags && flags[code] ? flags[code] : {};

        if (!flag.v && defaultValue == undefined) {
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

      const getPermissions = () => {
        const orgCode = getClaimValue('org_code');
        const permissions = getClaimValue('permissions');
        return {
          permissions,
          orgCode
        };
      };

      const getPermission = (key) => {
        const orgCode = getClaimValue('org_code');
        const permissions = getClaimValue('permissions') || [];
        return {
          isGranted: permissions.some((p) => p === key),
          orgCode
        };
      };

      const getOrganization = () => {
        const orgCode = getClaimValue('org_code');
        return {
          orgCode
        };
      };

      const getUserOrganizations = () => {
        const orgCodes = getClaimValue('org_codes', 'id_token');
        return {
          orgCodes
        };
      };

      const getToken = () => {
        return tokens && tokens.access_token_encoded
          ? tokens.access_token_encoded
          : undefined;
      };

      setState((previous) => ({
        ...previous,
        user,
        getToken,
        getClaim,
        getFlag,
        getBooleanFlag,
        getStringFlag,
        getIntegerFlag,
        getPermissions,
        getPermission,
        getOrganization,
        getUserOrganizations,
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
    getToken,
    getClaim,
    getFlag,
    getBooleanFlag,
    getStringFlag,
    getIntegerFlag,
    getPermissions,
    getPermission,
    getOrganization,
    getUserOrganizations,
    error,
    isLoading
  } = state;
  return (
    <AuthContext.Provider
      value={{
        user,
        error,
        getToken,
        getClaim,
        getFlag,
        getBooleanFlag,
        getStringFlag,
        getIntegerFlag,
        getPermissions,
        getPermission,
        getOrganization,
        getUserOrganizations,
        isLoading,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
