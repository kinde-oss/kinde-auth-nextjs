"use client";
import { KindeState } from "../../../types.js";
import { constructKindeClientState } from "../../factories/index.js";
import { getRefreshTokensServerAction } from "../../utils.js";
import { useFetchedKindeState } from "../internal/use-fetched-kinde-state.js";

/**
 *
 * @returns {KindeState}
 */
export const useProviderlessKindeAuth = (
  apiPath = process.env.NEXT_PUBLIC_KINDE_AUTH_API_PATH ||
    process.env.KINDE_AUTH_API_PATH ||
    "/api/auth",
): KindeState => {
  const { getFetchedState, refetch } = useFetchedKindeState();

  const refreshData = async () => {
    const refreshTokens = await getRefreshTokensServerAction();
    if (refreshTokens) {
      await refreshTokens();
      await refetch();
    } else {
      console.warn(
        "[Kinde] refreshData is only available in Next.js App Router environments, version 14 or higher.",
      );
    }
  };

  const clientState = constructKindeClientState(getFetchedState());

  return {
    ...clientState,
    refreshData,
  };
};
