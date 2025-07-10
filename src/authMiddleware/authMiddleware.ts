import { NextResponse } from "next/server";
import { config, routes } from "../config/index";
import { KindeAccessToken, KindeIdToken } from "../types";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { isTokenExpired } from "../utils/jwt/validation";
import { getAccessToken } from "../utils/getAccessToken";
import { kindeClient } from "../session/kindeServerClient";
import { sessionManager } from "../session/sessionManager";
import { getSplitCookies } from "../utils/cookies/getSplitSerializedCookies";
import { getIdToken } from "../utils/getIdToken";
import { OAuth2CodeExchangeResponse } from "@kinde-oss/kinde-typescript-sdk";
import { copyCookiesToRequest } from "../utils/copyCookiesToRequest";
import { getStandardCookieOptions } from "../utils/cookies/getStandardCookieOptions";
import { isPublicPathMatch } from "../utils/isPublicPathMatch";

const handleMiddleware = async (req, options, onSuccess) => {
  const { pathname, search } = req.nextUrl;

  const isReturnToCurrentPage = options?.isReturnToCurrentPage;
  const orgCode: string | undefined = options?.orgCode;
  const loginPage = options?.loginPage || `${config.apiPath}/${routes.login}`;
  const callbackPage = `${config.apiPath}/kinde_callback`;
  const registerPage = `${config.apiPath}/${routes.register}`;
  const setupPage = `${config.apiPath}/${routes.setup}`;

  if (
    loginPage == pathname ||
    callbackPage == pathname ||
    registerPage == pathname ||
    setupPage == pathname
  ) {
    return NextResponse.next();
  }

  let publicPaths = ["/_next", "/favicon.ico"];
  if (options?.publicPaths !== undefined) {
    if (Array.isArray(options?.publicPaths)) {
      publicPaths = options.publicPaths;
    }
  }

  const loginRedirectUrlParams = new URLSearchParams();

  if (orgCode) {
    loginRedirectUrlParams.set("org_code", orgCode);
  }

  if (isReturnToCurrentPage) {
    loginRedirectUrlParams.set("post_login_redirect_url", pathname + search);
  }

  const queryString = loginRedirectUrlParams.toString();
  const loginRedirectUrl = queryString
    ? `${loginPage}?${queryString}`
    : loginPage;

  // Use extracted utility for public path matching
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const isPublicPath = isPublicPathMatch(
    pathname,
    publicPaths,
    config.isDebugMode,
  );

  // getAccessToken will validate the token
  let kindeAccessToken = await getAccessToken(req);
  // getIdToken will validate the token
  let kindeIdToken = await getIdToken(req);

  // if no access token, redirect to login
  if ((!kindeAccessToken || !kindeIdToken) && !isPublicPath) {
    if (config.isDebugMode) {
      console.log(
        "authMiddleware: no access or id token, redirecting to login",
      );
    }
    return NextResponse.redirect(
      new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL),
    );
  }

  const session = await sessionManager(req);
  let refreshResponse: OAuth2CodeExchangeResponse | null = null;
  const resp = NextResponse.next();

  // if accessToken is expired, refresh it
  if (isTokenExpired(kindeAccessToken) || isTokenExpired(kindeIdToken)) {
    if (config.isDebugMode) {
      console.log("authMiddleware: access token expired, refreshing");
    }

    const sendResult = (debugMessage: string): NextResponse | undefined => {
      if (config.isDebugMode) {
        console.error(debugMessage);
      }
      if (!isPublicPath) {
        return NextResponse.redirect(
          new URL(
            loginRedirectUrl,
            options?.redirectURLBase || config.redirectURL,
          ),
        );
      }
      return undefined;
    };

    try {
      refreshResponse = await kindeClient.refreshTokens(session, false);
      kindeAccessToken = refreshResponse.access_token;
      kindeIdToken = refreshResponse.id_token;
      if (config.isDebugMode) {
        console.log(
          "authMiddleware: tokens refreshed",
          !!refreshResponse.access_token,
          !!refreshResponse.id_token,
        );
      }
    } catch (error) {
      const result = sendResult("authMiddleware: error refreshing tokens");
      if (result) return result;
    }

    try {
      // if we want layouts/pages to get immediate access to the new token,
      // we need to set the cookie on the response here
      const splitAccessTokenCookies = getSplitCookies(
        "access_token",
        refreshResponse.access_token,
      );
      splitAccessTokenCookies.forEach((cookie) => {
        resp.cookies.set(cookie.name, cookie.value, cookie.options);
      });

      const splitIdTokenCookies = getSplitCookies(
        "id_token",
        refreshResponse.id_token,
      );
      splitIdTokenCookies.forEach((cookie) => {
        resp.cookies.set(cookie.name, cookie.value, cookie.options);
      });

      resp.cookies.set(
        "refresh_token",
        refreshResponse.refresh_token,
        getStandardCookieOptions(),
      );

      // copy the cookies from the response to the request
      // in Next versions prior to 14.2.8, the cookies function
      // reads the Set-Cookie header from the *request* object, not the *response* object
      // in order to get the new cookies to the request, we need to copy them over
      copyCookiesToRequest(req, resp);

      if (config.isDebugMode) {
        console.log("authMiddleware: tokens refreshed and cookies updated");
      }
    } catch (error) {
      const result = sendResult(
        "authMiddleware: error settings new token in cookie",
      );
      if (result) return result;
    }
  }

  // we don't bail out earlier than here because we want to refresh the tokens
  // if they are expired, even if the path is public
  if (isPublicPath) {
    return resp;
  }

  let accessTokenValue: KindeAccessToken | null = null;
  let idTokenValue: KindeIdToken | null = null;

  try {
    accessTokenValue = jwtDecoder<KindeAccessToken>(kindeAccessToken);
  } catch (error) {
    if (config.isDebugMode) {
      console.error(
        "authMiddleware: access token decode failed, redirecting to login",
      );
    }
    return NextResponse.redirect(
      new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL),
    );
  }

  try {
    idTokenValue = jwtDecoder<KindeIdToken>(kindeIdToken);
  } catch (error) {
    if (config.isDebugMode) {
      console.error(
        "authMiddleware: id token decode failed, redirecting to login",
      );
    }
    return NextResponse.redirect(
      new URL(loginRedirectUrl, options?.redirectURLBase || config.redirectURL),
    );
  }

  const customValidationValid = options?.isAuthorized
    ? options.isAuthorized({ req, token: accessTokenValue })
    : true;

  if (customValidationValid && onSuccess) {
    if (config.isDebugMode) {
      console.log("authMiddleware: invoking onSuccess callback");
    }
    const callbackResult = await onSuccess({
      token: accessTokenValue,
      user: {
        family_name: idTokenValue.family_name,
        given_name: idTokenValue.given_name,
        email: idTokenValue.email,
        id: idTokenValue.sub,
        picture: idTokenValue.picture,
      },
    });

    // If a user returned a response from their onSuccess callback, copy our refreshed tokens to it
    if (callbackResult instanceof NextResponse) {
      if (config.isDebugMode) {
        console.log(
          "authMiddleware: onSuccess callback returned a response, copying our cookies to it",
        );
      }
      // Copy our cookies to their response
      resp.cookies.getAll().forEach((cookie) => {
        callbackResult.cookies.set(cookie.name, cookie.value, {
          ...cookie,
        });
      });

      // Copy any headers we set (if any) to their response
      resp.headers.forEach((value, key) => {
        callbackResult.headers.set(key, value);
      });

      return callbackResult;
    }

    // If they didn't return a response, return our response with the refreshed tokens
    if (config.isDebugMode) {
      console.log(
        "authMiddleware: onSuccess callback did not return a response, returning our response",
      );
    }

    return resp;
  }

  if (customValidationValid) {
    if (config.isDebugMode) {
      console.log(
        "authMiddleware: customValidationValid is true, returning response",
      );
    }
    return resp;
  }

  if (config.isDebugMode) {
    console.log("authMiddleware: default behaviour, redirecting to login");
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
