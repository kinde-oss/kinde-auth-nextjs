import React, {
  useContext,
  useState,
  createContext,
  useCallback,
  useEffect
} from 'react';

import {config} from '../config/index';

const handleError = () => {
  throw new Error(
    'Oops! Seems like you forgot to wrap your app in <KindeProvider>.'
  );
};

const AuthContext = createContext({
  ...config.initialState,
  user: handleError,
  isLoading: handleError
});

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
    ...config.initialState
  });

  const setupUrl = `${config.apiPath}/setup`;

  // try and get the user (by fetching /api/auth/setup) -> this needs to do the OAuth stuff
  const checkSession = useCallback(async () => {
    try {
      const kindeData = await tokenFetcher(setupUrl);
      setState((previous) => ({
        ...previous,
        ...kindeData,
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
    error,
    isLoading,
    permissions,
    featureFlags,
    organization,
    userOrganizations,
    accessToken,
    idToken
  } = state;

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        idToken,
        user,
        error,
        isLoading,
        permissions,
        featureFlags,
        organization,
        userOrganizations,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
