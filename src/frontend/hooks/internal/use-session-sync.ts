"use client";
import { useCallback, useEffect, useState } from "react";
import {
  FetchedKindeState,
  KindeNextClientState,
  PublicKindeConfig,
} from "../../types";
import { useSyncState } from "./use-sync-state";
import { fetchKindeState } from "../../utils";
import { DefaultKindeNextClientState } from "../../constants";
import * as store from "../../store";
import { StorageKeys } from "@kinde/js-utils";

export const useSessionSync = () => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<PublicKindeConfig | null>(null);
  const [getFetchedState, setFetchedState] = useSyncState<KindeNextClientState>(
    DefaultKindeNextClientState,
  );

  const setupState = useCallback(async () => {
    const setupResponse = await fetchKindeState();

    if (setupResponse.success === false) {
      setFetchedState({
        ...DefaultKindeNextClientState,
        isLoading: false,
        error: setupResponse.error,
      });
      await store.clientStorage.destroySession();
      console.log("setupResponse unsuccessful", setupResponse);
      setConfig(setupResponse.env);

      setLoading(false);

      return {
        success: false,
        error: setupResponse.error,
      };
    }

    const { accessTokenEncoded, idTokenRaw, ...kindeState } =
      setupResponse.kindeState;

    setFetchedState({
      ...kindeState,
      accessTokenEncoded,
      idTokenRaw,
      isLoading: false,
      error: null,
    });

    console.log("setupResponse successful", setupResponse);

    setConfig(setupResponse.env);

    await store.clientStorage.setItems({
      [StorageKeys.accessToken]: accessTokenEncoded,
      [StorageKeys.idToken]: idTokenRaw,
    });

    setLoading(false);

    return {
      success: true,
      [StorageKeys.accessToken]: accessTokenEncoded,
      [StorageKeys.idToken]: idTokenRaw,
    };
  }, []);

  useEffect(() => {
    setupState();
  }, []);

  return {
    config,
    getFetchedState,
    loading,
    refetch: setupState,
  };
};
