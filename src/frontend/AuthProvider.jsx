import React, {
  useContext,
  useState,
  createContext,
  useCallback,
  useEffect,
} from "react";
import { config } from "../config/index";

const handleError = () => {
  throw new Error(
    "Oops! Seems like you forgot to wrap your app in <KindeProvider>."
  );
};

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} last_name
 * @property {string} first_name
 * @property {string | null} provided_id
 * @property {string} preferred_email
 */

/**
 * @typedef {Object} State
 * @property {User} user
 * @property {boolean} isLoading
 * @property {boolean} isAuthenticated
 * @property {string=} error
 */

/**
 * @returns {React.Context<State>}
 */
const AuthContext = createContext({
  ...config.initialState,
  user: handleError,
  isLoading: handleError,
});

/**
 * Use auth context.
 * @returns {State}
 */
export const useKindeAuth = () => useContext(AuthContext);

const userFetcher = async (url) => {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new RequestError(0);
  }

  if (response.ok) {
    return response.json();
  } else if (response.status === 401) {
    return undefined;
  }
};

export const KindeProvider = ({ children }) => {
  const [state, setState] = useState({
    ...config.initialState,
  });

  const profileUrl = "/api/auth/me";

  // try and get the user (by fetching /api/auth/me) -> this needs to do the OAuth stuff
  const checkSession = useCallback(async () => {
    try {
      const user = await userFetcher(profileUrl);
      setState((previous) => ({
        ...previous,
        user,
        error: undefined,
      }));
    } catch (error) {
      setState((previous) => ({ ...previous, error }));
    }
  }, [profileUrl]);

  // if you get the user set loading false
  useEffect(() => {
    const checkLoading = async () => {
      await checkSession();
      setState((previous) => ({
        ...previous,
        isLoading: false,
      }));
    };
    if (!state.user) {
      checkLoading();
    }
  }, [state.user]);

  // provide this stuff to the rest of your app
  const { user, error, isLoading } = state;
  return (
    <AuthContext.Provider
      value={{ user, error, isLoading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};
