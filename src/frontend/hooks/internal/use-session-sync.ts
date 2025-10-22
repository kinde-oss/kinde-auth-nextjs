"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FetchedKindeState,
  KindeNextClientState,
  PublicKindeConfig,
} from "../../types";
import { useSyncState } from "./use-sync-state";
import { fetchKindeState } from "../../utils";
import { DefaultKindeNextClientState } from "../../constants";
import * as store from "../../store";
import {
  getDecodedToken,
  RefreshTokenResult,
  setRefreshTimer,
  StorageKeys,
} from "@kinde-oss/kinde-auth-react/utils";
import { JWTDecoded } from "@kinde/jwt-decoder";
import { config as sdkConfig } from "../../../config/index";

export const calculateExpirySeconds = async (): Promise<number | null> => {
  const token = await getDecodedToken<JWTDecoded>("accessToken");
  if (!token) return null;

  return token.exp - Math.floor(Date.now() / 1000);
};

export const useSessionSync = (shouldAutoRefresh = true) => {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<PublicKindeConfig | null>(null);
  const [getFetchedState, setFetchedState] = useSyncState<KindeNextClientState>(
    DefaultKindeNextClientState,
  );

  const handleError = useCallback(
    async (error: string) => {
      await store.clientStorage.destroySession();
      setFetchedState({
        ...DefaultKindeNextClientState,
        isLoading: false,
        error,
      });
    },
    [setFetchedState],
  );

  const refreshHandlerRef = useRef<(() => Promise<RefreshTokenResult>) | null>(
    null,
  );

  const updateTokensAndSetRefresh = useCallback(
    async (kindeState: Omit<FetchedKindeState, "env">) => {
      const { accessTokenEncoded, idTokenRaw } = kindeState;

      await store.clientStorage.setItems({
        [StorageKeys.accessToken]: accessTokenEncoded,
        [StorageKeys.idToken]: idTokenRaw,
      });

      if (shouldAutoRefresh) {
        const expiry = await calculateExpirySeconds();
        const handler = refreshHandlerRef.current;
        if (handler) {
          setRefreshTimer(expiry, handler);
        }
      }

      setFetchedState({
        ...kindeState,
        isLoading: false,
        error: null,
      });
    },
    [setFetchedState, shouldAutoRefresh],
  );

  const refreshHandler = useCallback(async (): Promise<RefreshTokenResult> => {
    const setupResponse = await fetchKindeState();

    if (!setupResponse.success) {
      await handleError("User is unauthenticated or refresh failed");
      return {
        success: false,
        error: "User is unauthenticated or refresh failed",
      };
    }

    await updateTokensAndSetRefresh(setupResponse.kindeState);

    return {
      success: true,
      idToken: setupResponse.kindeState.idTokenRaw,
      accessToken: setupResponse.kindeState.accessTokenEncoded,
    };
  }, [handleError, updateTokensAndSetRefresh]);

  useEffect(() => {
    refreshHandlerRef.current = refreshHandler;
  }, [refreshHandler]);

  const setupState = useCallback(async () => {
    const setupResponse = await fetchKindeState();

    if (setupResponse.success === false) {
      if (sdkConfig.isDebugMode) {
        console.log("setupResponse unsuccessful", setupResponse);
      }
      await handleError(setupResponse.error);
      setConfig(setupResponse.env);
      setLoading(false);

      return {
        success: false,
        error: setupResponse.error,
      };
    }

    await updateTokensAndSetRefresh(setupResponse.kindeState);
    setConfig(setupResponse.env);
    setLoading(false);

    return {
      success: true,
      [StorageKeys.accessToken]: setupResponse.kindeState.accessTokenEncoded,
      [StorageKeys.idToken]: setupResponse.kindeState.idTokenRaw,
    };
  }, [handleError, updateTokensAndSetRefresh]);

  useEffect(() => {
    setupState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    config,
    getFetchedState,
    loading,
    refetch: setupState,
    refreshHandler,
  };
};
