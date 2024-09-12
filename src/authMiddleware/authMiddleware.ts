import jwt_decode from 'jwt-decode';
import {NextRequest, NextResponse} from 'next/server';
import {KindeAccessToken, KindeIdToken} from '../../types';
import {config} from '../config/index';
import {isTokenValid} from '../utils/pageRouter/isTokenValid';

const trimTrailingSlash = (str: string) =>
  str && str.charAt(str.length - 1) === '/' ? str.slice(0, -1) : str;

export function authMiddleware(request: NextRequest) {
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

const handleMiddleware = async (
  req?: NextRequest,
  options?: {
    isReturnToCurrentPage?: boolean;
    loginPage?: string;
    publicPaths?: string[];
    redirectURLBase?: string;
    isAuthorized?: (args: {
      req: NextRequest;
      token: KindeAccessToken;
    }) => boolean;
  },
  onSuccess?: (args: {token: any; user: any}) => any
) => {
  const {pathname} = req.nextUrl;

  const isReturnToCurrentPage = options?.isReturnToCurrentPage;
  const loginPage = options?.loginPage || '/api/auth/login';

  let publicPaths = ['/_next', '/favicon.ico'];
  if (options?.publicPaths !== undefined) {
    if (Array.isArray(options?.publicPaths)) {
      publicPaths = options.publicPaths;
    }
  }

  const loginRedirectUrl = isReturnToCurrentPage
    ? `${loginPage}?post_login_redirect_url=${pathname}`
    : loginPage;

  if (loginPage == pathname || publicPaths.some((p) => pathname.startsWith(p)))
    return;

  const kindeToken = req.cookies.get('access_token');

  if (!kindeToken) {
    const response = NextResponse.redirect(
      new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL)
    );
    return response;
  }

  const accessTokenValue: KindeAccessToken = jwt_decode(
    req.cookies.get('access_token').value
  );
  const idTokenValue: KindeIdToken = jwt_decode(
    req.cookies.get('id_token')?.value
  );

  const isAuthorized = options?.isAuthorized
    ? options.isAuthorized({req, token: accessTokenValue})
    : isTokenValid(kindeToken.value);

  if (isAuthorized && onSuccess) {
    return await onSuccess({
      token: accessTokenValue,
      user: {
        family_name: idTokenValue.family_name,
        given_name: idTokenValue.given_name,
        email: idTokenValue.email,
        id: idTokenValue.sub,
        picture: idTokenValue.picture
      }
    });
  }

  if (isAuthorized) {
    return;
  }

  return NextResponse.redirect(
    new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL)
  );
};

export type KindeRequest = NextRequest & {
  kindeAuth: {
    token: KindeAccessToken;
    user: {
      family_name: string;
      given_name: string;
      email: string;
      id: string;
      picture: string;
    };
  };
};

export function withAuth(
  reqOrMiddleware: NextRequest | ((req: KindeRequest) => any),
  options?: {
    isReturnToCurrentPage?: boolean;
    loginPage?: string;
    publicPaths?: string[];
    redirectURLBase?: string;
    isAuthorized?: (args: {req: NextRequest; token: any}) => boolean;
  }
) {
  if (reqOrMiddleware instanceof Function) {
    return async (req: any) =>
      await handleMiddleware(req, options, async ({token, user}) => {
        req.kindeAuth = {token, user};
        return await reqOrMiddleware(req);
      });
  }
  return handleMiddleware(reqOrMiddleware, options);
}
