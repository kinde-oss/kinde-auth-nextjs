import {config} from '../config/index';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo
} from 'react';
import React from 'react';
import {KindeFlagRaw, KindeSetupResponse, KindeState} from '../../types';

export const flagDataTypeMap = {
  s: 'string',
  i: 'integer',
  b: 'boolean'
};

const AuthContext = createContext({
  ...config.initialState
});

export const useKindeAuth = (): KindeState => useContext(AuthContext);

/**
 *
 * @param {string} url
 * @returns {Promise<import('../../types').KindeSetupResponse | undefined>}
 */

const tokenFetcher = async (
  url: string
): Promise<KindeSetupResponse | undefined> => {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error('Network error');
  }
  if (response.status == 204) return undefined;
  if (response.ok) return response.json();
  throw new Error('Error fetching data');
};

/**
 *
 * @param {children: import('react').ReactNode, options?: {apiPath: string} | undefined} props
 * @returns
 */
export const KindeProvider = ({children}) => {
  const setupUrl = `${config.apiPath}/setup`;
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<KindeState>({
    ...config.initialState
  });

  const checkSession = useCallback(async (): Promise<void> => {
    try {
      if (timer) clearTimeout(timer);

      const kindeData = await tokenFetcher(setupUrl);

      const getFlag = (
        code: string,
        defaultValue: any,
        flagType: 'b' | 'i' | 's'
      ) => {
        const flags = kindeData?.featureFlags;
        if (!flags) {
          throw Error('No flags found');
        }

        if (!flags[code]) {
          throw Error(`Flag ${code} was not found`);
        } else {
          const flag = flags[code];

          if (Object.keys(flag).length === 0 && defaultValue == undefined) {
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
            is_default: flag.v == null,
            defaultValue: defaultValue
          };
        }
      };

      setState((previous) => ({
        ...previous,
        error: undefined,
        accessToken: kindeData?.accessToken,
        idToken: kindeData?.idToken,
        permissions: kindeData?.permissions,
        organization: kindeData?.organization,
        featureFlags: kindeData?.featureFlags,
        userOrganizations: kindeData?.userOrganizations,
        accessTokenEncoded: kindeData?.accessTokenEncoded,
        accessTokenRaw: kindeData?.accessTokenEncoded,
        getAccessToken: () => kindeData?.accessToken,
        idTokenEncoded: kindeData?.idTokenEncoded,
        getAccessTokenRaw: () => kindeData?.accessTokenEncoded,
        getBooleanFlag: (code: string, defaultValue: boolean) => {
          try {
            const flag = getFlag(code, defaultValue, 'b');
            return flag.value;
          } catch (err) {
            if (config.isDebugMode) {
              console.error(err);
            }
          }
        },
        getIntegerFlag: (code: string, defaultValue: number) => {
          try {
            const flag = getFlag(code, defaultValue, 'i');
            return flag.value;
          } catch (err) {
            if (config.isDebugMode) {
              console.error(err);
            }
          }
        },
        getStringFlag: (code: string, defaultValue: string) => {
          try {
            const flag = getFlag(code, defaultValue, 's');
            return flag.value;
          } catch (err) {
            if (config.isDebugMode) {
              console.error(err);
            }
          }
        },
        getOrganization: () => kindeData?.organization,
        getPermission: (key: string) => {
          return {
            isGranted: kindeData.permissions.permissions.some((p) => p === key),
            orgCode: kindeData.organization.orgCode
          };
        },
        getPermissions: () => kindeData.permissions,
        getUser: () => kindeData.user,
        getToken: () => kindeData.accessTokenRaw,
        getUserOrganizations: () => kindeData.userOrganizations,
        idTokenRaw: kindeData?.idTokenRaw,
        refreshData: checkSession,
        getClaim: (claim: string, tokenKey = 'access_token') => {
          const token =
            tokenKey === 'access_token'
              ? kindeData.accessToken
              : kindeData.idToken;
          return token ? {name: claim, value: token[claim]} : null;
        },
        getFlag,
        getIdTokenRaw: () => kindeData?.idTokenEncoded,
        getIdToken: () => kindeData?.idToken,
        isAuthenticated: true,
        isLoading: false,
        user: kindeData?.user
      }));

      const delay = kindeData?.accessToken.exp * 1000 - Date.now();
      if (delay > 0) {
        const t = setTimeout(checkSession, delay);
        setTimer(t);
      } else {
        await checkSession();
      }
    } catch (error) {
      setState((previous) => ({...previous, error, isAuthenticated: false}));
    }
  }, [setupUrl]);

  useEffect((): void => {
    if (state.accessToken) return;
    (async (): Promise<void> => {
      await checkSession();
      setState((previous) => ({...previous, isLoading: false}));
    })();
  }, [state.accessToken]);

  return (
    <AuthContext.Provider value={{...state}}>{children}</AuthContext.Provider>
  );
};
