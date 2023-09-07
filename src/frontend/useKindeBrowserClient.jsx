import React, {useEffect, useState} from 'react';

export function useKindeBrowserClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [userOrganizations, setUserOrganizations] = useState(null);
  const [featureFlags, setFeatureFlags] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getKindeData = async () => {
      setIsLoading(true);
      const res = await fetch('/api/auth/kinde_data');
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setUser(data.user);
        setPermissions(data.permissions);
        setOrganization(data.organization);
        setUserOrganizations(data.userOrganizations);
        setFeatureFlags(data.featureFlags);
      }
      setIsLoading(false);
    };

    getKindeData();
  }, []);
  const isAuthenticated = user != null;
  return {
    isAuthenticated,
    error,
    user,
    permissions,
    organization,
    userOrganizations,
    featureFlags,
    isLoading
  };
}
