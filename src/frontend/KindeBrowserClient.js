import {useEffect, useState} from 'react';

export const useKindeBrowserClient = () => {
  const [state, setState] = useState({
    user: null,
    isAuthenticated: false,
    permissions: null,
    featureFlags: null,
    error: null,
    isLoading: true,
    featureFlags: null,
    organization: null,
    userOrganizations: null,
    accessToken: null,
    idToken: null
  });

  useEffect(() => {
    const fetchData = async () => {
      const kindeData = await fetch('/api/auth/setup');
      if (kindeData) {
        setState(await kindeData.json());
      }
    };

    fetchData();
  }, []);

  return {...state, isAuthenticated: !!state.user};
};
