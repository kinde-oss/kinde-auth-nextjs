import jwt_decode from 'jwt-decode';
import {NextResponse} from 'next/server';
import {config} from '../config/index';
import {isTokenValid} from '../utils/pageRouter/isTokenValid';

const trimTrailingSlash = (str) =>
  str.charAt(str.length - 1) === '/' ? str.slice(0, -1) : str;

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
  const {pathname, search, origin, basePath, url} = req.nextUrl;

  const loginPage = '/api/auth/login';
  const publicPaths = ['/_next', '/favicon.ico'];

  if (loginPage == pathname || publicPaths.some((p) => pathname.startsWith(p)))
    return;

  const kindeToken = req.cookies.get('kinde_token');
  if (!kindeToken) {
    const response = NextResponse.redirect(
      new URL('/api/auth/login', config.redirectURL)
    );
    response.cookies.set('kinde_next_page', req.nextUrl.href);
    return response;
  }
  const accessTokenValue = jwt_decode(
    JSON.parse(kindeToken.value).access_token
  );
  console.log(JSON.parse(kindeToken.value).id_token);
  const idToken = jwt_decode(JSON.parse(kindeToken.value).id_token);
  // const idToken = null;
  const {family_name, given_name, email, sub: id} = idToken;
  const userValue = {
    family_name,
    given_name,
    email,
    id
  };

  const isAuthorized =
    isTokenValid(kindeToken.value) &&
    options.isAuthorized({req, token: accessTokenValue});

  if (isAuthorized && onSuccess) {
    return await onSuccess({
      token: accessTokenValue,
      user: userValue
    });
  }

  return NextResponse.redirect(new URL('/api/auth/login', config.redirectURL));
};

export default function withAuth(...args) {
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
