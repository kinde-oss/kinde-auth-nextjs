const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  checkSession: null,
};

const SESSION_PREFIX = "pkce-verifier";

const KINDE_REDIRECT_URL = process.env.KINDE_REDIRECT_URL;
const KINDE_ISSUER_URL = process.env.KINDE_ISSUER_URL;
const KINDE_POST_LOGOUT_REDIRECT_ROUTE =
  process.env.KINDE_POST_LOGOUT_REDIRECT_ROUTE;
const KINDE_CLIENT_ID = process.env.KINDE_CLIENT_ID;
const KINDE_CLIENT_SECRET = process.env.KINDE_CLIENT_SECRET;

export const config = {
  initialState,
  SESSION_PREFIX,
  redirectURL: KINDE_REDIRECT_URL,
  issuerURL: KINDE_ISSUER_URL,
  clientID: KINDE_CLIENT_ID,
  clientSecret: KINDE_CLIENT_SECRET,
  responseType: "code",
  scope: "openid offline",
  codeChallengeMethod: "S256",
  redirectRoutes: {
    callback: "/api/auth/kinde_callback",
    postLogoutRedirect: KINDE_POST_LOGOUT_REDIRECT_ROUTE || "/",
  },
  issuerRoutes: {
    logout: "/logout",
    login: "/oauth2/auth",
    register: "/oauth2/auth",
    token: "/oauth2/token",
    profile: "/oauth2/user_profile",
  },
};
