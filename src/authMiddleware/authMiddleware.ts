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
import { isNonSafeMethod } from "../utils/isNonSafeMethod";
import { buildAuthRedirectUrl } from "../utils/buildAuthRedirectUrl";

/**
 * Handles invitation code redirect logic.
 * Redirects to the register page with the invitation code, or falls back to
 * the auth redirect URL on error.
 *
 * Non-safe HTTP methods (POST, PUT, etc.) cannot follow a 3xx redirect, so
 * a 401 JSON response is returned instead.
 */
const handleInvitationCodeRedirect = (
  req,
  invitationCode: string,
  registerPage: string,
  authRedirectUrl: string,
  redirectURLBase: string | undefined,
): NextResponse => {
  if (isNonSafeMethod(req)) {
    return NextResponse.json(
      { statusCode: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const params = new URLSearchParams();
    params.set("invitation_code", invitationCode);
    params.set("is_invitation", "true");

    const registerWithInviteRedirectUrl = `${registerPage}?${params.toString()}`;

    return NextResponse.redirect(
      new URL(
        registerWithInviteRedirectUrl,
        redirectURLBase || config.redirectURL,
      ),
    );
  } catch (error) {
    if (config.isDebugMode) {
      console.error(
        "authMiddleware: error redirecting to register with invitation code",
        error,
      );
    }
    return NextResponse.redirect(
      new URL(authRedirectUrl, redirectURLBase || config.redirectURL),
    );
  }
};

/**
 * Redirects the user to the auth/login page, or returns a 401 JSON response
 * for non-safe HTTP methods (POST, PUT, etc.) that cannot follow a 3xx redirect.
 */
const authRedirect = (
  req,
  authRedirectUrl: string,
  redirectURLBase: string | undefined,
): NextResponse => {
  if (isNonSafeMethod(req)) {
    return NextResponse.json(
      { statusCode: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }
  return NextResponse.redirect(
    new URL(authRedirectUrl, redirectURLBase || config.redirectURL),
  );
};

const handleMiddleware = async (req, options, onSuccess) => {
  const { pathname, search } = req.nextUrl;

  const params = new URLSearchParams(search);
  const invitationCode = params.get("invitation_code");
  const hasInvitationCode = !!invitationCode?.trim();
  const isReturnToCurrentPage = options?.isReturnToCurrentPage;
  const orgCode: string | undefined = options?.orgCode;
  const loginPage = options?.loginPage || `${config.apiPath}/${routes.login}`;
  const callbackPage = `${config.apiPath}/kinde_callback`;
  const registerPage = `${config.apiPath}/${routes.register}`;
  const setupPage = `${config.apiPath}/${routes.setup}`;

  // Let the auth SDK's own routes through without any checks.
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

  // Build the URL to send unauthenticated users to, including any optional
  // org_code and post_login_redirect_url query parameters.
  const authRedirectUrl = buildAuthRedirectUrl(loginPage, {
    orgCode,
    isReturnToCurrentPage,
    pathname,
    search,
  });

  if (hasInvitationCode) {
    return handleInvitationCodeRedirect(
      req,
      invitationCode,
      registerPage,
      authRedirectUrl,
      options?.redirectURLBase,
    );
  }

  const isPublicPath = isPublicPathMatch(
    pathname,
    publicPaths,
    config.isDebugMode,
  );

  // getAccessToken will validate the token
  let kindeAccessToken = await getAccessToken(req);
  // getIdToken will validate the token
  let kindeIdToken = await getIdToken(req);

  // No valid tokens — send to login (or 401 for non-safe methods).
  if ((!kindeAccessToken || !kindeIdToken) && !isPublicPath) {
    if (config.isDebugMode) {
      console.log(
        "authMiddleware: no access or id token, redirecting to login",
      );
    }
    return authRedirect(req, authRedirectUrl, options?.redirectURLBase);
  }

  const session = await sessionManager(req);
  let refreshResponse: OAuth2CodeExchangeResponse | null = null;
  const resp = NextResponse.next();

  // If either token is within 20 seconds of expiry, attempt a silent refresh.
  if (
    isTokenExpired(kindeAccessToken, 20) ||
    isTokenExpired(kindeIdToken, 20)
  ) {
    if (config.isDebugMode) {
      console.log("authMiddleware: access token expired, refreshing");
    }

    const sendResult = (debugMessage: string): NextResponse | undefined => {
      if (config.isDebugMode) {
        console.error(debugMessage);
      }
      if (!isPublicPath) {
        return authRedirect(req, authRedirectUrl, options?.redirectURLBase);
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
      let persistent = true;
      const payload: { ksp?: { persistent: boolean } } | null = jwtDecoder<{
        ksp: { persistent: boolean };
      }>(refreshResponse.access_token);
      if (payload) {
        persistent = payload.ksp?.persistent ?? true;
      }
      // Set the refreshed tokens on the response so layouts/pages can read them
      // immediately without waiting for the next request cycle.
      const splitAccessTokenCookies = getSplitCookies(
        "access_token",
        refreshResponse.access_token,
      );
      splitAccessTokenCookies.forEach((cookie) => {
        if (!persistent) {
          delete cookie.options.maxAge;
        }
        resp.cookies.set(cookie.name, cookie.value, cookie.options);
      });

      const splitIdTokenCookies = getSplitCookies(
        "id_token",
        refreshResponse.id_token,
      );
      splitIdTokenCookies.forEach((cookie) => {
        if (!persistent) {
          delete cookie.options.maxAge;
        }
        resp.cookies.set(cookie.name, cookie.value, cookie.options);
      });

      const standardCookieOptions = getStandardCookieOptions();
      if (!persistent) {
        delete standardCookieOptions.maxAge;
      }
      resp.cookies.set(
        "refresh_token",
        refreshResponse.refresh_token,
        standardCookieOptions,
      );

      // Copy refreshed cookies to the request so Next.js versions prior to
      // 14.2.8 can read them from the request object (not just the response).
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

  // Token refresh (if needed) is always attempted before bailing on public paths,
  // so that public pages still receive up-to-date cookies.
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
    return authRedirect(req, authRedirectUrl, options?.redirectURLBase);
  }

  try {
    idTokenValue = jwtDecoder<KindeIdToken>(kindeIdToken);
  } catch (error) {
    if (config.isDebugMode) {
      console.error(
        "authMiddleware: id token decode failed, redirecting to login",
      );
    }
    return authRedirect(req, authRedirectUrl, options?.redirectURLBase);
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

    // If the onSuccess callback returned its own response, forward our
    // refreshed token cookies onto it before returning.
    if (callbackResult instanceof NextResponse) {
      if (config.isDebugMode) {
        console.log(
          "authMiddleware: onSuccess callback returned a response, copying our cookies to it",
        );
      }

      resp.cookies.getAll().forEach((cookie) => {
        callbackResult.cookies.set(cookie.name, cookie.value, {
          ...cookie,
        });
      });

      copyCookiesToRequest(req, callbackResult);

      return callbackResult;
    }

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

  return authRedirect(req, authRedirectUrl, options?.redirectURLBase);
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
