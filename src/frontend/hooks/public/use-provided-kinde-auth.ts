"use client";
import { KindeContextProps, useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { KindeState } from "../../../types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DefaultKindeNextClientState } from "../../constants";
import { KindeNextClientState } from "../../types";
import { getFlagFactory } from "../../factories/feature-flag-factory";
import {
  constructKindeClientState,
  transformReactAuthStateToNextState,
} from "../../factories";
import { getRefreshTokensServerAction } from "../../utils";

// This isn't particularly pretty,
// but we need to make `useKindeAuth` adhere
// to the KindeState type to avoid breaking changes.
// TODO: Revisit for v3
export const useProvidedKindeAuth = (): KindeState => {
  const [nextState, setNextState] = useState<KindeNextClientState>(
    DefaultKindeNextClientState,
  );
  const reactAuth = useKindeAuth();

  const transformState = useCallback(async () => {
    const transformedState =
      await transformReactAuthStateToNextState(reactAuth);
    setNextState(transformedState);
  }, [reactAuth]);

  useEffect(() => {
    transformState();
  }, [transformState]);

  const clientState = useMemo(
    () => constructKindeClientState(nextState),
    [nextState],
  );

  const refreshData = async () => {
    const refreshTokens = await getRefreshTokensServerAction();
    if (refreshTokens) {
      await refreshTokens();
    } else {
      console.warn(
        "[Kinde] refreshData is only available in Next.js App Router environments, version 14 or higher.",
      );
    }
  };

  return {
    ...clientState,
    refreshData,
  };
};
