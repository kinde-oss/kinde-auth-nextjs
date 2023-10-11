import {useEffect, useState} from 'react';
import {flagDataTypeMap} from './AuthProvider.jsx';

/**
 *
 * @returns {import('./AuthProvider').State}
 */
export const useKindeBrowserClient = () => {
  const [state, setState] = useState({
    accessToken: null,
    error: null,
    featureFlags: [],
    idToken: null,
    isAuthenticated: false,
    isLoading: true,
    organization: null,
    permissions: [],
    user: null,
    userOrganizations: []
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/auth/setup');
      const kindeData = await res.json();
      if (res.status == 200) {
        setState({
          ...kindeData
        });
      }
      const error = kindeData.error;
      setState((prev) => ({...prev, isLoading: false, error}));
    };

    fetchData();
  }, []);

  const getFlag = (code, defaultValue, flagType) => {
    const flags = state.featureFlags || [];
    const flag = flags && flags[code] ? flags[code] : {};

    if (flag == {} && defaultValue == undefined) {
      throw Error(
        `Flag ${code} was not found, and no default value has been provided`
      );
    }

    if (flagType && flag.t && flagType !== flag.t) {
      throw Error(
        `Flag ${code} is of type ${flagDataTypeMap[flag.t]} - requested type ${
          flagDataTypeMap[flagType]
        }`
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

  const getClaim = (claim, tokenKey = 'access_token') => {
    const token =
      tokenKey === 'access_token' ? state.accessToken : state.idToken;
    return token ? {name: claim, value: token[claim]} : null;
  };

  return {
    ...state,
    isAuthenticated: !!state.user,
    getPermission: (key) => {
      return {
        isGranted: state.permissions.some((p) => p === key),
        orgCode: state.organization
      };
    },
    getBooleanFlag,
    getIntegerFlag,
    getFlag,
    getStringFlag,
    getClaim
  };
};
