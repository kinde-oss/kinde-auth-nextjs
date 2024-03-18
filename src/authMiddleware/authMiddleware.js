import jwt_decode from 'jwt-decode';
import {NextResponse} from 'next/server';
import {config} from '../config/index';
import {isTokenValid} from '../utils/pageRouter/isTokenValid';

const trimTrailingSlash = (str) =>
  str && str.charAt(str.length - 1) === '/' ? str.slice(0, -1) : str;

export function authMiddleware(request) {
  let isAuthenticated = false;
  const nextUrl = trimTrailingSlash(request.nextUrl.href);
  const logoutUrl = trimTrailingSlash(config.postLogoutRedirectURL);
  const kinde_token = request.cookies.get('kinde_token');
  const isLogoutUrl = nextUrl === logoutUrl;

  if (kinde_token) {
    const payload = jwt_decode(JSON.parse(kinde_token.value).access_token);
    isAuthenticated = true;
  }

  if (!isAuthenticated && !isLogoutUrl) {
    return NextResponse.redirect(
      new URL(config.postLogoutRedirectURL, request.url)
    );
  }

  if (isAuthenticated && isLogoutUrl) {
    return NextResponse.redirect(new URL(config.postLoginRedirectURL));
  }

  return NextResponse.next();
}

const handleMiddleware = async (req, options, onSuccess) => {
  const {pathname} = req.nextUrl;

  const isReturnToCurrentPage = options?.isReturnToCurrentPage;
  const loginPage = options?.loginPage || '/api/auth/login';
  const publicPaths = options?.publicPaths || ['/_next', '/favicon.ico'];

  const loginRedirectUrl = isReturnToCurrentPage
    ? `${loginPage}?post_login_redirect_url=${pathname}`
    : loginPage;

  if (loginPage == pathname || publicPaths.some((p) => pathname.startsWith(p)))
    return;

  const kindeToken = req.cookies.get('access_token');

  if (!kindeToken) {
    const response = NextResponse.redirect(
      new URL(loginRedirectUrl, config.redirectURL)
    );
    return response;
  }

  const accessTokenValue = jwt_decode(req.cookies.get('access_token').value);

  const isAuthorized = options?.isAuthorized
    ? options.isAuthorized({req, token: accessTokenValue})
    : isTokenValid(kindeToken.value);

  if (isAuthorized && onSuccess) {
    return await onSuccess({
      token: accessTokenValue,
      user: JSON.parse(req.cookies.get('user').value)
    });
  }

  if (isAuthorized) {
    return;
  }

  return NextResponse.redirect(new URL(loginRedirectUrl, config.redirectURL));
};

/**
 * @param {Request} [req]
 * @param {function(req: Request & {kindeAuth: {user: any, token: string}})} [onIsAuthorized]
 */
export function withAuth(...args) {
  // most basic usage - no options
  if (!args.length || args[0] instanceof Request) {
    return handleMiddleware(...args);
  }

  // passing through the kindeAuth data to the middleware function
  if (typeof args[0] === 'function') {
    const middleware = args[0];
    const options = args[1];
    return async (...args) =>
      await handleMiddleware(args[0], options, async ({token, user}) => {
        args[0].kindeAuth = {token, user};
        return await middleware(...args);
      });
  }

  // includes options
  const options = args[0];
  return async (...args) => await handleMiddleware(args[0], options);
}
