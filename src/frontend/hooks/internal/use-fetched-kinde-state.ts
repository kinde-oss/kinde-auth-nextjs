"use client";
import { useCallback, useEffect, useState } from "react";
import { FetchedKindeState, KindeNextClientState } from "../../types";
import { useSyncState } from "./use-sync-state";
import { fetchKindeState } from "../../utils";
import { DefaultKindeNextClientState } from "../../constants";
import * as store from "../../store"

type UseFetchedKindeStateProps = {
  onSuccess?: (state: FetchedKindeState) => void | Promise<void>;
};

export const useFetchedKindeState = ({
  onSuccess,
}: UseFetchedKindeStateProps = {}) => {
  const [loading, setLoading] = useState(true);
  const [getFetchedState, setFetchedState] = useSyncState<KindeNextClientState>(
    DefaultKindeNextClientState,
  );

  const setupState = useCallback(async () => {
    const setupResponse = await fetchKindeState();
    if (setupResponse.success === true) {
      const { env, ...kindeState } = setupResponse.kindeState;
      setFetchedState({
        ...kindeState,
        isLoading: false,
        error: null,
      });
      await onSuccess?.({ ...kindeState, env });
    } else {
      setFetchedState({
        ...DefaultKindeNextClientState,
        isLoading: false,
        error: setupResponse.error,
      });
      await store.clientStorage.destroySession();
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setupState();
  }, [setupState]);

  return {
    getFetchedState,
    loading,
    refetch: setupState,
  };
};
