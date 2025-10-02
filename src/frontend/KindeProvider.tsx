"use client";
import { KindeProvider as KindeReactProvider } from "@kinde-oss/kinde-auth-react";
import React, { useState } from "react";
import { config } from "../config";
import { useFetchedKindeState } from "./hooks/internal/use-fetched-kinde-state";
import * as store from "./store";
import { StorageKeys } from "@kinde/js-utils";

type KindeProviderProps = {
  children: React.ReactNode;
};

export const KindeProvider = ({ children }: KindeProviderProps) => {
  const [stateIsSet, setStateIsSet] = useState(false);
  const { loading } = useFetchedKindeState({
    onSuccess: async (state) => {
      console.log("KindeProvider fetched state");
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
      setStateIsSet(true);
    },
  });
  if (loading || !stateIsSet) return null;
  return (
    <KindeReactProvider
      clientId={config.clientID}
      domain={config.issuerURL}
      redirectUri={config.redirectURL}
      store={store.clientStorage}
    >
      {children}
    </KindeReactProvider>
  );
};
