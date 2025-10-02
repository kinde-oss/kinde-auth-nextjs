'use client';
import { useEffect, useState } from 'react';
import { FetchedKindeState, KindeNextClientState } from '../../types';
import { useSyncState } from './use-sync-state';
import { fetchKindeState } from '../../utils';
import { DefaultKindeNextClientState } from '../../constants';



type UseFetchedKindeStateProps = {
  onSuccess?: (state: FetchedKindeState) => void | Promise<void>;
};

export const useFetchedKindeState = ({
  onSuccess,
}: UseFetchedKindeStateProps = {}) => {
  const [loading, setLoading] = useState(true);
  const [getFetchedState, setFetchedState] = useSyncState<KindeNextClientState>(
    DefaultKindeNextClientState
  );

  const setupState = async () => {
    const setupResponse = await fetchKindeState();
    if (setupResponse.success === true) {
      setFetchedState({
        ...setupResponse.kindeState,
        isLoading: false,
        error: null,
      });
      await onSuccess?.(setupResponse.kindeState);
    } else {
      setFetchedState({
        ...DefaultKindeNextClientState,
        isLoading: false,
        error: setupResponse.error,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    setupState();
  }, []);

  return {
    getFetchedState,
    loading,
    refetch: setupState,
  };
};
