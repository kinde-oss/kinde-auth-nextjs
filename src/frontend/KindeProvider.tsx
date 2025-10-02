"use client";
import { KindeProvider as KindeReactProvider } from "@kinde-oss/kinde-auth-react";
import React, { useState } from "react";
import { useFetchedKindeState } from "./hooks/internal/use-fetched-kinde-state";
import * as store from "./store";
import { StorageKeys } from "@kinde/js-utils";
import { PublicKindeConfig } from "./types";

type KindeProviderProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export const KindeProvider = ({ children, fallback }: KindeProviderProps) => {
  const [config, setConfig] = useState<PublicKindeConfig | null>(null);
  const { loading } = useFetchedKindeState({
    onSuccess: async (state) => {
      await Promise.all([
        store.clientStorage.setSessionItem(
          StorageKeys.accessToken,
          state.accessTokenEncoded,
        ),
        store.clientStorage.setSessionItem(
          StorageKeys.idToken,
          state.idTokenRaw,
        ),
      ]);
      setConfig(state.env);
    },
  });
  if (loading) return fallback ?? null;
  if (!config) {
    console.error("[KindeProvider] Failed to fetch config");
    return fallback ?? null;
  }
  return (
    <KindeReactProvider
      clientId={config.clientId}
      domain={config.issuerUrl}
      redirectUri={config.redirectUrl}
      store={store.clientStorage}
    >
      {children}
    </KindeReactProvider>
  );
};
