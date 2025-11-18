"use client";
import {
  KindeProvider as KindeReactProvider,
  ActivityTimeoutConfig,
  TimeoutActivityType,
} from "@kinde-oss/kinde-auth-react";
import React, { useMemo } from "react";
import { useSessionSync } from "./hooks/internal/use-session-sync";
import * as store from "./store";
import { storageSettings } from "@kinde-oss/kinde-auth-react/utils";
import { config as sdkConfig, routes } from "../config/index";

type KindeProviderProps = {
  children: React.ReactNode;
  waitForInitialLoad?: boolean;
  activityTimeout?: ActivityTimeoutConfig;
};

export const KindeProvider = ({
  children,
  waitForInitialLoad,
  activityTimeout,
}: KindeProviderProps) => {
  const { loading, config, refreshHandler } = useSessionSync();

  // Wrap the user's onTimeout callback to handle Next.js logout
  const wrappedActivityTimeout = useMemo(() => {
    if (!activityTimeout) return undefined;

    return {
      ...activityTimeout,
      onTimeout: async (type: TimeoutActivityType) => {
        try {
          // Call user's callback first (for alerts, logging, etc.)
          await activityTimeout.onTimeout?.(type);
        } catch (error) {
          if (sdkConfig.isDebugMode) {
            console.error(
              "[KindeProvider] activityTimeout.onTimeout failed",
              error,
            );
          }
        }

        // End session by revoking tokens and clearing local session
        if (type === TimeoutActivityType.timeout) {
          window.location.href = `${sdkConfig.apiPath}/end_session`;
        }
      },
    };
  }, [activityTimeout]);

  storageSettings.onRefreshHandler = refreshHandler;

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
      activityTimeout={wrappedActivityTimeout}
    >
      {children}
    </KindeReactProvider>
  );
};
