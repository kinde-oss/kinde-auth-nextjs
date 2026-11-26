import { jwtDecoder } from "@kinde/jwt-decoder";
import { KindeAccessToken, KindeIdToken } from "../types";
import { config } from "../config/index";
import { generateUserObject } from "../utils/generateUserObject";
import { getAccessToken } from "../utils/getAccessToken";
import RouterClient from "../routerClients/RouterClient";
import { getIdToken } from "../utils/getIdToken";
import { sessionManager } from "../session/sessionManager";
import { isTokenExpired } from "../utils/jwt/validation";
import { refreshTokensSingleFlight } from "../utils/refreshTokensSingleFlight";
import {
  isStaleRefreshError,
  shouldDestroySessionManagerForRefreshError,
} from "../utils/isTerminalRefreshError";
import { shouldClearSessionForRefreshError } from "../utils/staleRefreshTokenGuard";

const isTransientRefreshFailure = (error: unknown): boolean =>
  error instanceof TypeError ||
  error instanceof SyntaxError ||
  (typeof AggregateError !== "undefined" && error instanceof AggregateError) ||
  (typeof DOMException !== "undefined" && error instanceof DOMException);

const refreshWithOptionalRetry = async (
  session: Awaited<ReturnType<typeof sessionManager>>,
  req: RouterClient["req"],
): Promise<{
  accessTokenEncoded: string;
  idTokenEncoded: string;
}> => {
  const attemptRefresh = () => refreshTokensSingleFlight(session, true);

  try {
    const refreshResponse = await attemptRefresh();
    return {
      accessTokenEncoded: refreshResponse.access_token,
      idTokenEncoded: refreshResponse.id_token,
    };
  } catch (error) {
    // Middleware and setup do not share the in-process single-flight map.
    // Re-read cookies in case a concurrent winner already updated them.
    // Do NOT call shouldClearSessionForRefreshError here — the outer catch
    // owns the single stale-bound assessment. A same-request network retry
    // on STALE would incorrectly promote first-chance stale to terminal.
    if (config.isDebugMode) {
      console.error("setup: refresh tokens failed — assessing retry", error);
    }

    const accessAfter = await getAccessToken(req);
    const idAfter = await getIdToken(req);
    if (accessAfter && idAfter && !isTokenExpired(accessAfter, 20)) {
      return {
        accessTokenEncoded: accessAfter,
        idTokenEncoded: idAfter,
      };
    }

    // Transient transport only: one network retry. STALE is left for the
    // client / next request so the stale-token bound stays cross-request.
    if (isTransientRefreshFailure(error)) {
      const retryResponse = await attemptRefresh();
      return {
        accessTokenEncoded: retryResponse.access_token,
        idTokenEncoded: retryResponse.id_token,
      };
    }

    throw error;
  }
};

/**
 *
 * @param {RouterClient} routerClient
 * @returns
 */
export const setup = async (routerClient: RouterClient) => {
  try {
    let accessTokenEncoded = await getAccessToken(routerClient.req);
    let idTokenEncoded = await getIdToken(routerClient.req);

    if (!accessTokenEncoded || !idTokenEncoded) {
      if (config.isDebugMode) {
        console.log("setup: no access or id token - returning NOT_LOGGED_IN");
      }
      return routerClient.json(
        {
          message: "NOT_LOGGED_IN",
          env: {
            clientId: config.clientID,
            issuerUrl: config.issuerURL,
            redirectUrl: config.redirectURL,
          },
        },
        { status: 401 },
      );
    }

    const session = await sessionManager(routerClient.req, routerClient.res);

    if (isTokenExpired(accessTokenEncoded, 20)) {
      if (config.isDebugMode) {
        console.log("setup: access or id token expired - attempting refresh");
      }
      try {
        const refreshed = await refreshWithOptionalRetry(
          session,
          routerClient.req,
        );
        accessTokenEncoded = refreshed.accessTokenEncoded;
        idTokenEncoded = refreshed.idTokenEncoded;
      } catch (error) {
        if (config.isDebugMode) {
          console.error(
            "setup: refresh tokens failed - returning error",
            error,
          );
        }

        const failedRefreshToken =
          await session.getSessionItem("refresh_token");
        const failedToken =
          typeof failedRefreshToken === "string" ? failedRefreshToken : null;
        const clearSession = await shouldClearSessionForRefreshError(
          session,
          error,
          failedToken,
        );

        if (
          (await shouldDestroySessionManagerForRefreshError(
            clearSession,
            error,
          )) &&
          typeof session.destroySession === "function"
        ) {
          try {
            await session.destroySession();
          } catch {
            // Best-effort clear on terminal failure.
          }
        }

        return routerClient.json(
          {
            message: clearSession
              ? "REFRESH_FAILED"
              : isStaleRefreshError(error)
                ? "REFRESH_IN_PROGRESS_OR_STALE"
                : "REFRESH_FAILED",
            error: error instanceof Error ? error.message : error,
            env: {
              clientId: config.clientID,
              issuerUrl: config.issuerURL,
              redirectUrl: config.redirectURL,
            },
          },
          { status: 401 },
        );
      }
    }

    let accessToken: KindeAccessToken | null = null;
    let idToken: KindeIdToken | null = null;

    try {
      accessToken = jwtDecoder<KindeAccessToken>(accessTokenEncoded);
    } catch (error) {
      if (config.isDebugMode) {
        console.error(
          "setup: access token decode failed, redirecting to login",
        );
      }
      return routerClient.json(
        {
          message: "ACCESS_TOKEN_DECODE_FAILED",
          error: error instanceof Error ? error.message : error,
          env: {
            clientId: config.clientID,
            issuerUrl: config.issuerURL,
            redirectUrl: config.redirectURL,
          },
        },
        { status: 401 },
      );
    }

    try {
      idToken = jwtDecoder<KindeIdToken>(idTokenEncoded);
    } catch (error) {
      if (config.isDebugMode) {
        console.error("setup: id token decode failed, redirecting to login");
      }
      return routerClient.json(
        {
          message: "ID_TOKEN_DECODE_FAILED",
          error: error instanceof Error ? error.message : error,
          env: {
            clientId: config.clientID,
            issuerUrl: config.issuerURL,
            redirectUrl: config.redirectURL,
          },
        },
        { status: 401 },
      );
    }

    if (!accessToken || !idToken) {
      return routerClient.json(
        {
          message: "TOKENS_MISSING",
          error: "No access or id token",
          env: {
            clientId: config.clientID,
            issuerUrl: config.issuerURL,
            redirectUrl: config.redirectURL,
          },
        },
        { status: 401 },
      );
    }

    const permissions = accessToken.permissions;

    const organization = accessToken.org_code;
    const featureFlags = accessToken.feature_flags;
    const userOrganizations = idToken.org_codes;
    const orgName = accessToken.org_name;
    const orgProperties = accessToken.organization_properties;
    const orgNames = idToken.organizations;

    return routerClient.json({
      accessToken,
      accessTokenEncoded,
      accessTokenRaw: accessTokenEncoded,
      idToken,
      idTokenRaw: idTokenEncoded,
      idTokenEncoded,
      user: generateUserObject(idToken, accessToken),
      permissions: {
        permissions,
        orgCode: organization,
      },
      needsRefresh: false,
      message: "OK",
      organization: {
        orgCode: organization,
        orgName,
        properties: {
          city: orgProperties?.kp_org_city?.v,
          industry: orgProperties?.kp_org_industry?.v,
          postcode: orgProperties?.kp_org_postcode?.v,
          state_region: orgProperties?.kp_org_state_region?.v,
          street_address: orgProperties?.kp_org_street_address?.v,
          street_address_2: orgProperties?.kp_org_street_address_2?.v,
        },
      },
      featureFlags,
      userOrganizations: {
        orgCodes: userOrganizations,
        orgs: orgNames?.map((org) => ({
          code: org?.id,
          name: org?.name,
        })),
      },
      env: {
        clientId: config.clientID,
        issuerUrl: config.issuerURL,
        redirectUrl: config.redirectURL,
      },
    });
  } catch (error) {
    if (config.isDebugMode) {
      console.error("setup: failed, error: ", error);
    }

    return routerClient.json(
      {
        message: "SETUP_FAILED",
        error: error instanceof Error ? error.message : error,
        env: {
          clientId: config.clientID,
          issuerUrl: config.issuerURL,
          redirectUrl: config.redirectURL,
        },
      },
      { status: 500 },
    );
  }
};
