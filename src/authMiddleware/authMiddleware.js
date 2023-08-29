import jwt_decode from 'jwt-decode';
import {NextResponse} from 'next/server';
import {config} from '../config/index';

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
    return NextResponse.redirect(new URL(config.postLoginURL));
  }

  return NextResponse.next();
}
