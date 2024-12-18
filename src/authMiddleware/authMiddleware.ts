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
import { copyCookiesToRequest } from "../utils/copyCookiesToRequest";

/**
 * Standard middleware matcher pattern for Next.js applications
 * 
 * This regex pattern matches all routes except:
 * - Next.js internal routes (_next/*)
 * - Static files with common extensions:
 *   - HTML/CSS: .html, .css
 *   - Scripts: .js (but not .json)
 *   - Images: .jpg, .jpeg, .webp, .png, .gif, .svg 
 *   - Fonts: .ttf, .woff, .woff2
 *   - Documents: .csv, .doc, .docx, .xls, .xlsx
 *   - Other: .ico, .zip, .webmanifest
 * 
 * Use this as the matcher config in Next.js middleware to protect all routes
 * except static assets and Next.js internals.
 */
export const kindeStandardMiddlewareMatcher = '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'

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
  let kindeAccessToken = await getAccessToken(req);

  // if no access token, redirect to login
  if (!kindeAccessToken) {
    if(config.isDebugMode) {
      console.log('authMiddleware: no id token, redirecting to login')
    }
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
      kindeAccessToken = refreshResponse.access_token

      // if we want layouts/pages to get immediate access to the new token,
      // we need to set the cookie on the response here
      const splitCookies = getSplitCookies("access_token", refreshResponse.access_token)
      splitCookies.forEach((cookie) => {
        resp.cookies.set(cookie.name, cookie.value, cookie.options);
      })

      // copy the cookies from the response to the request
      // in Next versions prior to 14.2.8, the cookies function
      // reads the Set-Cookie header from the *request* object, not the *response* object
      // in order to get the new cookies to the request, we need to copy them over
      copyCookiesToRequest(req, resp)

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
  let kindeIdToken = await getIdToken(req);

  // if no id token, redirect to login
  if(!kindeIdToken) {
    if(config.isDebugMode) {
      console.log('authMiddleware: no id token, redirecting to login')
    }
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

      kindeIdToken = refreshResponse.id_token
      
      // as above, if we want layouts/pages to get immediate access to the new token,
      // we need to set the cookie on the response here
      const splitCookies = getSplitCookies("id_token", refreshResponse.id_token)
      splitCookies.forEach((cookie) => {
        resp.cookies.set(cookie.name, cookie.value, cookie.options);
      })

      copyCookiesToRequest(req, resp)

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

  let accessTokenValue: KindeAccessToken | null = null
  let idTokenValue: KindeIdToken | null = null

  try {
    accessTokenValue = jwtDecoder<KindeAccessToken>(
      kindeAccessToken,
    );
  } catch(error) {
    if(config.isDebugMode) {
      console.error('authMiddleware: access token decode failed, redirecting to login')
    }
    return NextResponse.redirect(
      new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL),
    );
  }

  try {
    idTokenValue = jwtDecoder<KindeIdToken>(
      kindeIdToken,
    );
  } catch(error) {
    if(config.isDebugMode) {
      console.error('authMiddleware: id token decode failed, redirecting to login')
    }
    return NextResponse.redirect(
      new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL),
    );
  }

  const customValidationValid = options?.isAuthorized
    ? options.isAuthorized({ req, token: accessTokenValue })
    : true;

  if (customValidationValid && onSuccess) {
    if(config.isDebugMode) {
      console.log('authMiddleware: invoking onSuccess callback')
    }
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
    if(config.isDebugMode) {
      console.log('authMiddleware: customValidationValid is true, returning response')
    }
    return resp;
  }

  if(config.isDebugMode) {
    console.log('authMiddleware: default behaviour, redirecting to login')
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
