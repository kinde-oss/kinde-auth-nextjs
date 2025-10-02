import { useEffect, useState } from 'react';
import { FetchedKindeState, KindeClientState } from '../types';
import { useSyncState } from './use-sync-state';
import { fetchKindeState } from '../utils';

const DefaultKindeClientState: KindeClientState = {
  accessToken: null,
  accessTokenEncoded: null,
  error: null,
  featureFlags: [],
  idToken: null,
  idTokenRaw: null,
  isAuthenticated: false,
  isLoading: true,
  organization: null,
  permissions: null,
  user: null,
  userOrganizations: null,
};

type UseFetchedKindeStateProps = {
  onSuccess?: (state: FetchedKindeState) => void | Promise<void>;
};

export const useFetchedKindeState = ({
  onSuccess,
}: UseFetchedKindeStateProps = {}) => {
  const [loading, setLoading] = useState(true);
  const [getState, setState] = useSyncState<KindeClientState>(
    DefaultKindeClientState
  );

  const setupState = async () => {
    const setupResponse = await fetchKindeState();
    if (setupResponse.success === true) {
      setState({
        ...setupResponse.kindeState,
        isLoading: false,
        error: null,
      });
      await onSuccess?.(setupResponse.kindeState);
    } else {
      setState({
        ...DefaultKindeClientState,
        isLoading: false,
        error: setupResponse.error,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    setupState();
  });

  return {
    getState,
    loading,
  };
};
