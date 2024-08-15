import {removeTrailingSlash} from '../utils/removeTrailingSlash';
import {version} from '../utils/version';

/**
 * @type {import('../../types').KindeState}
 */
const initialState = {
  accessToken: null,
  accessTokenRaw: null,
  error: null,
  featureFlags: [],
  idToken: null,
  idTokenRaw: null,
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
  refreshData: () => null
};

const SESSION_PREFIX = 'pkce-verifier';

const KINDE_SITE_URL = removeTrailingSlash(process.env.KINDE_SITE_URL);

// We need to use NEXT_PUBLIC for frontend vars
const KINDE_AUTH_API_PATH =
  removeTrailingSlash(process.env.NEXT_PUBLIC_KINDE_AUTH_API_PATH) ||
  removeTrailingSlash(process.env.KINDE_AUTH_API_PATH) ||
  '/api/auth';

const KINDE_POST_LOGIN_REDIRECT_URL =
  removeTrailingSlash(process.env.KINDE_POST_LOGIN_REDIRECT_URL) ||
  removeTrailingSlash(process.env.KINDE_POST_LOGIN_URL_REDIRECT_URL);
const KINDE_POST_LOGOUT_REDIRECT_URL = removeTrailingSlash(
  process.env.KINDE_POST_LOGOUT_REDIRECT_URL
);

const KINDE_ISSUER_URL = removeTrailingSlash(process.env.KINDE_ISSUER_URL);
const KINDE_CLIENT_ID = process.env.KINDE_CLIENT_ID;
const KINDE_CLIENT_SECRET = process.env.KINDE_CLIENT_SECRET;
const KINDE_AUDIENCE = process.env.KINDE_AUDIENCE;
const KINDE_COOKIE_DOMAIN = removeTrailingSlash(
  process.env.KINDE_COOKIE_DOMAIN
);
const KINDE_SCOPE = process.env.KINDE_SCOPE || 'openid profile email offline';

const isDebugMode = process.env.KINDE_DEBUG_MODE === 'true';

export const config = {
  isDebugMode,
  apiPath: KINDE_AUTH_API_PATH,
  initialState,
  SESSION_PREFIX,
  redirectURL: KINDE_SITE_URL,
  postLoginRedirectURL: KINDE_POST_LOGIN_REDIRECT_URL,
  issuerURL: KINDE_ISSUER_URL,
  clientID: KINDE_CLIENT_ID,
  clientSecret: KINDE_CLIENT_SECRET,
  postLogoutRedirectURL: KINDE_POST_LOGOUT_REDIRECT_URL,
  audience: KINDE_AUDIENCE ? KINDE_AUDIENCE.split(' ') : '',
  cookieDomain: KINDE_COOKIE_DOMAIN,
  responseType: 'code',
  codeChallengeMethod: 'S256',
  redirectRoutes: {
    callback: `${KINDE_AUTH_API_PATH}/kinde_callback`
  },
  issuerRoutes: {
    logout: '/logout',
    login: '/oauth2/auth',
    register: '/oauth2/auth',
    token: '/oauth2/token',
    profile: '/oauth2/v2/user_profile'
  },
  clientOptions: {
    audience: KINDE_AUDIENCE ? KINDE_AUDIENCE.split(' ') : '',
    authDomain: KINDE_ISSUER_URL || '',
    clientId: KINDE_CLIENT_ID || '',
    clientSecret: KINDE_CLIENT_SECRET || '',
    logoutRedirectURL: KINDE_POST_LOGOUT_REDIRECT_URL || '',
    redirectURL: `${KINDE_SITE_URL}/api/auth/kinde_callback`,
    frameworkVersion: version,
    scope: KINDE_SCOPE
  },
  grantType: 'AUTHORIZATION_CODE'
};
