import jwt_decode from 'jwt-decode';
import {NextResponse, NextRequest} from 'next/server';
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
  const {pathname, search, origin, basePath} = req.nextUrl;

  const loginPage = '/api/auth/login';
  const publicPaths = ['/_next', '/favicon.ico'];

  if (loginPage == pathname || publicPaths.some((p) => pathname.startsWith(p)))
    return;

  // // check if authenticated
  // const kindeToken = req.cookies.get('access_token');
  // if (!kindeToken) {
  //   // go sign in
  //   return NextResponse.redirect(
  //     new URL('/api/auth/login', config.redirectURL)
  //   );
  // }
  // const isAuthenticated = isTokenValid(kindeToken.value);

  // if (isAuthenticated) {
  //   return await onSuccess(token);
  // } else {
  //   console.log('not authed...');
  //   return NextResponse.redirect(
  //     new URL('/api/auth/login', config.redirectURL)
  //   );
  // }
};

export function withAuth(...args) {
  // most basic usage - no options
  if (!args.length || args[0] instanceof Request) {
    console.log('basic usage');
    return handleMiddleware(...args);
  }

  // passing through the kindeAuth data to the middleware function
  if (typeof args[0] === 'function') {
    const middleware = args[0];
    const options = args[1];
    return async (...args) =>
      await handleMiddleware(args[0], options, async (token) => {
        args[0].nextauth = {token};
        return await middleware(...args);
      });
  }

  // includes options
  const options = args[0];
  return async (...args) => await handleMiddleware(args[0], options);
}
