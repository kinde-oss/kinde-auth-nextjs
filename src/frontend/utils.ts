import { config, routes } from "../config/index.js";
import { FetchedKindeState } from "./types.js";

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
      kindeState: FetchedKindeState;
    }
  | {
      success: false;
      error: string;
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
    return { success: false, error: "Failed to fetch Kinde state" };
  }

  if (!res.ok) {
    return { success: false, error: "Failed to fetch Kinde state" };
  }

  let parsedBody: SetupResponse;
  try {
    parsedBody = (await res.json()) as SetupResponse;
  } catch (err) {
    if (config.isDebugMode) {
      console.error("Failed to parse Kinde state response", err);
    }
    return { success: false, error: "Failed to parse Kinde state response" };
  }

  const { message, error, ...kindeData } = parsedBody;

  switch (message) {
    case "OK":
      return { success: true, kindeState: kindeData };
    case "NOT_LOGGED_IN":
      return { success: false, error: "Not logged in" };
    default:
      return {
        success: false,
        error: `${message}: ${error || "An error occurred"}`,
      };
  }
};
