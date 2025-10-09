import { config, routes } from "../config/index.js";
import { FetchedKindeState, PublicKindeConfig } from "./types.js";

export const getRefreshTokensServerAction = async () => {
  try {
    const { refreshTokensServerAction } = await import(
      "../session/refreshTokensServerAction.js"
    );
    return refreshTokensServerAction;
  } catch (error) {
    return null;
  }
};

type FetchedKindeStateMessage = "OK" | "NOT_LOGGED_IN";

type SetupResponse = {
  message: FetchedKindeStateMessage;
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

export const fetchKindeState = async (): Promise<FetchKindeStateResponse> => {
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

  let parsedBody: SetupResponse;
  try {
    parsedBody = (await res.json()) as SetupResponse;
  } catch (err) {
    if (config.isDebugMode) {
      console.error("Failed to parse Kinde state response", err);
    }
    return {
      success: false,
      error: "Failed to parse Kinde state response",
      env: null,
    };
  }

  const { message, error, env, ...kindeData } = parsedBody;

  if (!res.ok) {
    return {
      success: false,
      error: error || message || "Failed to fetch Kinde state",
      env: env ?? null,
    };
  }

  switch (message) {
    case "OK":
      return { success: true, kindeState: kindeData, env };
    case "NOT_LOGGED_IN":
      return { success: false, error: "Not logged in", env };
    default:
      return {
        success: false,
        error: `${message}: ${error || "An error occurred"}`,
        env,
      };
  }
};
