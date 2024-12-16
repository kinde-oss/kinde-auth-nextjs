import { NextResponse } from "next/server";
import { config } from "../config/index";
import { KindeAccessToken, KindeIdToken } from "../../types";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { isTokenExpired } from "../utils/jwt/validation";
import { getAccessToken } from "../utils/getAccessToken";
import { kindeClient } from "../session/kindeServerClient";
import { sessionManager } from "../session/sessionManager";
import { getSplitCookies } from "../utils/cookies/getSplitSerializedCookies";
import { getIdToken } from "../utils/getIdToken";
import { OAuth2CodeExchangeResponse } from "@kinde-oss/kinde-typescript-sdk";

const handleMiddleware = async (req, options, onSuccess) => {
  const { pathname } = req.nextUrl;

  const isReturnToCurrentPage = options?.isReturnToCurrentPage;
  const loginPage = options?.loginPage || "/api/auth/login";

  let publicPaths = ["/_next", "/favicon.ico"];
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

  const resp = NextResponse.next();

  // getAccessToken will validate the token
  const kindeAccessToken = await getAccessToken(req);

  // if no access token, redirect to login
  if (!kindeAccessToken) {
    return NextResponse.redirect(
      new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL),
    );
  }

  const session = await sessionManager(req)
  let refreshResponse: OAuth2CodeExchangeResponse | null = null

  // if accessToken is expired, refresh it
  if(isTokenExpired(kindeAccessToken)) {
    if(config.isDebugMode) {
      console.log('authMiddleware: access token expired, refreshing')
    }

    try {
      refreshResponse = await kindeClient.refreshTokens(session);
      await session.setSessionItem("access_token", refreshResponse.access_token)

      // if we want layouts/pages to get immediate access to the new token,
      // we need to set the cookie on the response here
      const splitSerializedCookies = getSplitCookies("access_token", refreshResponse.access_token)
      splitSerializedCookies.forEach((cookie) => {
        resp.cookies.set(cookie.name, cookie.value, cookie.options);
      })

      if(config.isDebugMode) {
        console.log('authMiddleware: access token refreshed')
      }
    } catch(error) {
      // token is expired and refresh failed, redirect to login
      if(config.isDebugMode) {
        console.error('authMiddleware: access token refresh failed, redirecting to login')
      }
      return NextResponse.redirect(
        new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL),
      );
    }
  }

  // getIdToken will validate the token
  const kindeIdToken = await getIdToken(req);

  // if no id token, redirect to login
  if(!kindeIdToken) {
    return NextResponse.redirect(
      new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL),
    );
  }

  // if idToken is expired, refresh it
  if(isTokenExpired(kindeIdToken)) {
    if(config.isDebugMode) {
      console.log('authMiddleware: id token expired, refreshing')
    }

    try {
      // if we have a refresh response from an access token refresh, we'll use the id_token from that
      if(!refreshResponse) {
        refreshResponse = await kindeClient.refreshTokens(session);
      }

      
      await session.setSessionItem("id_token", refreshResponse.id_token)

      // as above, if we want layouts/pages to get immediate access to the new token,
      // we need to set the cookie on the response here
      const splitSerializedCookies = getSplitCookies("id_token", refreshResponse.id_token)
      splitSerializedCookies.forEach((cookie) => {
        resp.cookies.set(cookie.name, cookie.value, cookie.options);
      })

      if(config.isDebugMode) {
        console.log('authMiddleware: id token refreshed')
      }
    } catch(error) {
      // token is expired and refresh failed, redirect to login
      if(config.isDebugMode) {
        console.error('authMiddleware: id token refresh failed, redirecting to login')
      }
      return NextResponse.redirect(
        new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL),
      );
    }
  }

  const accessTokenValue = jwtDecoder<KindeAccessToken>(
    kindeAccessToken,
  );

  const idTokenValue = jwtDecoder<KindeIdToken>(
    kindeIdToken,
  );

  const customValidationValid = options?.isAuthorized
    ? options.isAuthorized({ req, token: accessTokenValue })
    : true;

  if (customValidationValid && onSuccess) {
    return await onSuccess({
      token: accessTokenValue,
      user: {
        family_name: idTokenValue.family_name,
        given_name: idTokenValue.given_name,
        email: idTokenValue.email,
        id: idTokenValue.sub,
        picture: idTokenValue.picture,
      },
    });
  }

  if (customValidationValid) {
    return resp;
  }

  return NextResponse.redirect(
    new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL),
  );
};

/**
 * @param {Request} [req]
 * @param {function(req: Request & {kindeAuth: {user: any, token: string}})} [onIsAuthorized]
 */
export function withAuth(...args) {
  // most basic usage - no options
  if (!args.length || args[0] instanceof Request) {
    // @ts-ignore
    return handleMiddleware(...args);
  }

  // passing through the kindeAuth data to the middleware function
  if (typeof args[0] === "function") {
    const middleware = args[0];
    const options = args[1];
    return async (...args) =>
      await handleMiddleware(args[0], options, async ({ token, user }) => {
        args[0].kindeAuth = { token, user };
        return await middleware(...args);
      });
  }

  // includes options
  const options = args[0];
  // @ts-ignore
  return async (...args) => await handleMiddleware(args[0], options);
}
