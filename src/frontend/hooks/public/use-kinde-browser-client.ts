"use client";
import { useContext } from "react";
import { useProvidedKindeAuth } from "./use-provided-kinde-auth";
import { useProviderlessKindeAuth } from "./use-providerless-kinde-auth";
import { KindeContext } from "@kinde-oss/kinde-auth-react";
import { KindeState } from "../../../types";

export const useKindeBrowserClient = (): KindeState => {
  const context = useContext(KindeContext);

  // If KindeContext provider exists, use the provided auth
  // Otherwise, use the providerless implementation
  if (context) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useProvidedKindeAuth();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useProviderlessKindeAuth();
};
