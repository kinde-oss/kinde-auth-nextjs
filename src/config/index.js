const initialState = {
  user: null,
  isLoading: true,
  checkSession: null
};

const SESSION_PREFIX = 'pkce-verifier';

const KINDE_SITE_URL = process.env.KINDE_SITE_URL;
const KINDE_POST_LOGIN_REDIRECT_URL =
  process.env.KINDE_POST_LOGIN_REDIRECT_URL ||
  process.env.KINDE_POST_LOGIN_URL_REDIRECT_URL;
const KINDE_POST_LOGOUT_REDIRECT_URL =
  process.env.KINDE_POST_LOGOUT_REDIRECT_URL;

const KINDE_ISSUER_URL = process.env.KINDE_ISSUER_URL;
const KINDE_CLIENT_ID = process.env.KINDE_CLIENT_ID;
const KINDE_CLIENT_SECRET = process.env.KINDE_CLIENT_SECRET;
const KINDE_AUDIENCE = process.env.KINDE_AUDIENCE;

export const config = {
  initialState,
  SESSION_PREFIX,
  redirectURL: KINDE_SITE_URL,
  postLoginURL: KINDE_POST_LOGIN_REDIRECT_URL,
  issuerURL: KINDE_ISSUER_URL,
  clientID: KINDE_CLIENT_ID,
  clientSecret: KINDE_CLIENT_SECRET,
  postLogoutRedirectURL: KINDE_POST_LOGOUT_REDIRECT_URL,
  audience: KINDE_AUDIENCE,
  responseType: 'code',
  scope: 'openid profile email offline',
  codeChallengeMethod: 'S256',
  redirectRoutes: {
    callback: '/api/auth/kinde_callback'
  },
  issuerRoutes: {
    logout: '/logout',
    login: '/oauth2/auth',
    register: '/oauth2/auth',
    token: '/oauth2/token',
    profile: '/oauth2/v2/user_profile'
  }
};
