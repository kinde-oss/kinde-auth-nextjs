"use client";
import { useKindeBrowserClient } from "./hooks/public/use-kinde-browser-client.js";

let hasWarned = false;

/**
 * @deprecated Use `useKindeBrowserClient` instead. `useKindeAuth` will be removed in a future major version.
 * @returns {import('../types').KindeState}
 */
export const useKindeAuth = () => {
  if (!hasWarned) {
    hasWarned = true;
    console.warn(
      "[Kinde] useKindeAuth() is deprecated. Please use useKindeBrowserClient() instead. " +
        "useKindeAuth will be removed in a future major version.",
    );
  }
  return useKindeBrowserClient();
};
