import { config, routes } from "../config/index.js";
import { FetchedKindeState, PublicKindeConfig } from "./types.js";

export const getRefreshTokensServerAction = async () => {
  try {
    const { refreshTokensServerAction } =
      await import("../session/refreshTokensServerAction.js");
    return refreshTokensServerAction;
  } catch (error) {
    return null;
  }
};

type FetchedKindeStateMessage =
  "OK" | "NOT_LOGGED_IN" | "REFRESH_IN_PROGRESS_OR_STALE" | "REFRESH_FAILED";

type SetupResponse = {
  message: FetchedKindeStateMessage | string;
  error: string | null;
} & FetchedKindeState;

type FetchKindeStateResponse =
  | {
      success: true;
      kindeState: Omit<FetchedKindeState, "env">;
      env: PublicKindeConfig;
    }
  | {
      success: false;
      error: string;
      env: PublicKindeConfig | null;
    };

const parseSetupResponse = async (
  res: Response,
): Promise<SetupResponse | null> => {
  try {
    return (await res.json()) as SetupResponse;
  } catch (err) {
    if (config.isDebugMode) {
      console.error("Failed to parse Kinde state response", err);
    }
    return null;
  }
};

export const fetchKindeState = async (
  hasRetriedStale = false,
): Promise<FetchKindeStateResponse> => {
  const setupUrl = `${config.apiPath}/${routes.setup}`;

  let res: Response;
  try {
    res = await fetch(setupUrl);
  } catch (err) {
    if (config.isDebugMode) {
      console.error("Failed to fetch Kinde state", err);
    }
    return { success: false, error: "Failed to fetch Kinde state", env: null };
  }

  const parsedBody = await parseSetupResponse(res);
  if (!parsedBody) {
    return {
      success: false,
      error: "Failed to parse Kinde state response",
      env: null,
    };
  }

  const { message, error, env, ...kindeData } = parsedBody;

  if (!res.ok) {
    // Race loser: retry setup once so winner cookies can be picked up.
    // Brief delay gives middleware Set-Cookie time to land before we re-hit
    // the token endpoint with the pre-rotation refresh cookie.
    if (message === "REFRESH_IN_PROGRESS_OR_STALE" && !hasRetriedStale) {
      if (config.isDebugMode) {
        console.debug(
          "fetchKindeState: retrying after REFRESH_IN_PROGRESS_OR_STALE",
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 200));
      return fetchKindeState(true);
    }

    // NOT_LOGGED_IN now returns 401 (previously 200), so it lands here.
    // Preserve the same human-readable error string as the old switch case did.
    if (message === "NOT_LOGGED_IN") {
      return { success: false, error: "Not logged in", env: env ?? null };
    }
    return {
      success: false,
      error: error || message || "Failed to fetch Kinde state",
      env: env ?? null,
    };
  }

  switch (message) {
    case "OK":
      return { success: true, kindeState: kindeData, env };
    default:
      return {
        success: false,
        error: `${message}: ${error || "An error occurred"}`,
        env,
      };
  }
};
