import { config, routes } from '../config/index.js';
import { FetchedKindeState } from './types.js';

export const getRefreshTokensServerAction = async () => {
  try {
    const { refreshTokensServerAction } = await import(
      '../session/refreshTokensServerAction.js'
    );
    return refreshTokensServerAction;
  } catch (error) {
    return null;
  }
};

type FetchedKindeStateMessage = 'OK' | 'NOT_LOGGED_IN';

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
  const res = await fetch(setupUrl);
  const { message, error, ...kindeData } = (await res.json()) as SetupResponse;
  if (!res.ok) {
    return {
      success: false,
      error: 'Failed to fetch Kinde state',
    };
  }

  switch (message) {
    case 'OK':
      return {
        success: true,
        kindeState: {
          ...kindeData,
        },
      };
    case 'NOT_LOGGED_IN':
      return {
        success: false,
        error: 'Not logged in',
      };
    default:
      return {
        success: false,
        error: `${message}: ${error || 'An error occurred'}`,
      };
  }
};
