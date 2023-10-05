import {useEffect, useState} from 'react';

/**
 *
 * @returns {import('./AuthProvider').State}
 */
export const useKindeBrowserClient = () => {
  const [state, setState] = useState({
    accessToken: null,
    error: null,
    isAuthenticated: false,
    isLoading: true,
    organization: null,
    permissions: null,
    user: null,
    userOrganizations: null,
    getBooleanFlag: null,
    getClaim: null,
    getFlag: null,
    getIntegerFlag: null,
    getPermission: null,
    getStringFlag: null
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/auth/setup');
      if (res.status == 200) {
        const kindeData = await res.json();

        const getFlag = (code, defaultValue, flagType) => {
          const flags = kindeData.featureFlags;
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
            isGranted: kindeData.permissions.some((p) => p === key),
            orgCode: kindeData.organization
          };
        };

        setState({
          ...kindeData,
          getBooleanFlag,
          getIntegerFlag,
          getFlag,
          getPermission,
          getStringFlag
        });
      }
    };

    fetchData();
  }, []);

  return {...state, isAuthenticated: !!state.user};
};
