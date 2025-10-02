import { removeTrailingSlash } from "../utils/removeTrailingSlash";
import packageJson from "../../package.json";

/**
 * @type {import('../../types').KindeState}
 */
const initialState = {
  accessToken: null,
  idToken: null,
  isAuthenticated: false,
  isLoading: true,
  organization: null,
  permissions: [],
  user: null,
  userOrganizations: [],
  getAccessToken: () => null,
  getBooleanFlag: () => null,
  getClaim: () => null,
  getFlag: () => null,
  getIdToken: () => null,
  getIntegerFlag: () => null,
  getOrganization: () => null,
  getPermission: () => null,
  getPermissions: () => [],
  getStringFlag: () => null,
  getToken: () => null,
  getUser: () => null,
  getUserOrganizations: () => null,
  refreshData: () => null,
};

const SESSION_PREFIX = "pkce-verifier";

const KINDE_SITE_URL = removeTrailingSlash(
  process.env.KINDE_SITE_URL || process.env.NEXT_PUBLIC_KINDE_SITE_URL,
);

const KINDE_POST_LOGIN_ALLOWED_URL_REGEX =
  process.env.KINDE_POST_LOGIN_ALLOWED_URL_REGEX;

// We need to use NEXT_PUBLIC for frontend vars
const KINDE_AUTH_API_PATH =
  removeTrailingSlash(process.env.NEXT_PUBLIC_KINDE_AUTH_API_PATH) ||
  removeTrailingSlash(process.env.KINDE_AUTH_API_PATH) ||
  "/api/auth";

const KINDE_POST_LOGIN_REDIRECT_URL =
  removeTrailingSlash(process.env.KINDE_POST_LOGIN_REDIRECT_URL) ||
  removeTrailingSlash(process.env.KINDE_POST_LOGIN_URL_REDIRECT_URL);
const KINDE_POST_LOGOUT_REDIRECT_URL = removeTrailingSlash(
  process.env.KINDE_POST_LOGOUT_REDIRECT_URL,
);

const KINDE_ISSUER_URL = removeTrailingSlash(
  process.env.KINDE_ISSUER_URL || process.env.NEXT_PUBLIC_KINDE_ISSUER_URL,
);
const KINDE_CLIENT_ID =
  process.env.KINDE_CLIENT_ID || process.env.NEXT_PUBLIC_KINDE_CLIENT_ID;
const KINDE_CLIENT_SECRET = process.env.KINDE_CLIENT_SECRET;
const KINDE_AUDIENCE = process.env.KINDE_AUDIENCE;
const KINDE_COOKIE_DOMAIN = removeTrailingSlash(
  process.env.KINDE_COOKIE_DOMAIN,
);
const KINDE_SCOPE = process.env.KINDE_SCOPE || "openid profile email offline";

const isDebugMode = process.env.KINDE_DEBUG_MODE === "true";

type Config = {
  isDebugMode: boolean;
  apiPath: string;
  initialState: any; // TODO: Fix this type
  SESSION_PREFIX: string;
  redirectURL: string;
  postLoginRedirectURL: string;
  postLoginAllowedURLRegex: string;
  issuerURL: string;
  clientID: string;
  clientSecret: string;
  postLogoutRedirectURL: string;
  audience: string[] | "";
  cookieDomain: string;
  responseType: "code";
  codeChallengeMethod: "S256";
  redirectRoutes: {
    callback: string;
  };
  issuerRoutes: {
    logout: "/logout";
    login: "/oauth2/auth";
    register: "/oauth2/auth";
    token: "/oauth2/token";
    profile: "/oauth2/v2/user_profile";
  };
  clientOptions: {
    audience: string[] | "";
    authDomain: string;
    clientId: string;
    clientSecret: string;
    logoutRedirectURL: string;
    redirectURL: string;
    frameworkVersion: string;
    scope: string;
  };
  grantType: "AUTHORIZATION_CODE";
};

export const config: Config = {
  isDebugMode,
  apiPath: KINDE_AUTH_API_PATH,
  initialState,
  SESSION_PREFIX,
  redirectURL: KINDE_SITE_URL,
  postLoginRedirectURL: KINDE_POST_LOGIN_REDIRECT_URL,
  postLoginAllowedURLRegex: KINDE_POST_LOGIN_ALLOWED_URL_REGEX,
  issuerURL: KINDE_ISSUER_URL,
  clientID: KINDE_CLIENT_ID,
  clientSecret: KINDE_CLIENT_SECRET,
  postLogoutRedirectURL: KINDE_POST_LOGOUT_REDIRECT_URL,
  audience: KINDE_AUDIENCE ? KINDE_AUDIENCE.split(" ") : "",
  cookieDomain: KINDE_COOKIE_DOMAIN,
  responseType: "code",
  codeChallengeMethod: "S256",
  redirectRoutes: {
    callback: `${KINDE_AUTH_API_PATH}/kinde_callback`,
  },
  issuerRoutes: {
    logout: "/logout",
    login: "/oauth2/auth",
    register: "/oauth2/auth",
    token: "/oauth2/token",
    profile: "/oauth2/v2/user_profile",
  },
  clientOptions: {
    audience: KINDE_AUDIENCE ? KINDE_AUDIENCE.split(" ") : "",
    authDomain: KINDE_ISSUER_URL || "",
    clientId: KINDE_CLIENT_ID || "",
    clientSecret: KINDE_CLIENT_SECRET || "",
    logoutRedirectURL: KINDE_POST_LOGOUT_REDIRECT_URL || "",
    redirectURL: `${KINDE_SITE_URL}${KINDE_AUTH_API_PATH}/kinde_callback`,
    frameworkVersion: packageJson.version,
    scope: KINDE_SCOPE,
  },
  grantType: "AUTHORIZATION_CODE",
};

const validateRoute = (route: string): string | null => {
  return route && /^[a-zA-Z0-9_-]+$/.test(route) ? route : null;
};

export const routes: {
  login: string;
  logout: string;
  register: string;
  createOrg: string;
  health: string;
  setup: string;
  portal: string;
} = {
  login: validateRoute(process.env.KINDE_AUTH_LOGIN_ROUTE) || "login",
  logout: validateRoute(process.env.KINDE_AUTH_LOGOUT_ROUTE) || "logout",
  register: validateRoute(process.env.KINDE_AUTH_REGISTER_ROUTE) || "register",
  createOrg:
    validateRoute(process.env.KINDE_AUTH_CREATEORG_ROUTE) || "create_org",
  health: validateRoute(process.env.KINDE_AUTH_HEALTH_ROUTE) || "health",
  setup: validateRoute(process.env.KINDE_AUTH_SETUP_ROUTE) || "setup",
  portal: validateRoute(process.env.KINDE_AUTH_PORTAL_ROUTE) || "portal",
};
