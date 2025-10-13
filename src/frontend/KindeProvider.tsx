"use client";
import { KindeProvider as KindeReactProvider } from "@kinde-oss/kinde-auth-react";
import React from "react";
import { useSessionSync } from "./hooks/internal/use-session-sync";
import * as store from "./store";
import { storageSettings } from "@kinde-oss/kinde-auth-react/utils";

type KindeProviderProps = {
  children: React.ReactNode;
  waitForInitialLoad?: boolean;
};

export const KindeProvider = ({
  children,
  waitForInitialLoad,
}: KindeProviderProps) => {
  const { loading, config } = useSessionSync();
  if (loading && waitForInitialLoad) return null;
  if (!config && !loading) {
    console.error("[KindeProvider] Failed to fetch config");
    return null;
  }

  return (
    <KindeReactProvider
      clientId={config?.clientId ?? ""}
      domain={config?.issuerUrl ?? ""}
      redirectUri={config?.redirectUrl ?? ""}
      store={store.clientStorage}
      forceChildrenRender
    >
      {children}
    </KindeReactProvider>
  );
};
