import { jwtDecoder } from "@kinde/jwt-decoder";
import { KindeAccessToken, KindeIdToken } from "../types";
import { config } from "../config/index";
import { generateUserObject } from "../utils/generateUserObject";
import { validateToken } from "@kinde/jwt-validator";
import { refreshTokens } from "../utils/refreshTokens";
import { getAccessToken } from "../utils/getAccessToken";
import RouterClient from "../routerClients/RouterClient";
import { getIdToken } from "../utils/getIdToken";
import { isTokenExpired } from "../utils/jwt/validation";
import { sessionManager } from "../session/sessionManager";
import { kindeClient } from "../session/kindeServerClient";

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
        },
        { status: 200 },
      );
    }

    const session = await sessionManager(routerClient.req);

    if (isTokenExpired(accessTokenEncoded) || isTokenExpired(idTokenEncoded)) {
      if (config.isDebugMode) {
        console.log("setup: access or id token expired - attempting refresh");
      }
      try {
        const refreshResponse = await kindeClient.refreshTokens(session);
        accessTokenEncoded = refreshResponse.access_token;
        idTokenEncoded = refreshResponse.id_token;
      } catch (error) {
        if (config.isDebugMode) {
          console.error("setup: refresh tokens failed - returning error");
        }
        return routerClient.json(
          { message: "REFRESH_FAILED", error },
          { status: 500 },
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
        { message: "ACCESS_TOKEN_DECODE_FAILED", error },
        { status: 500 },
      );
    }

    try {
      idToken = jwtDecoder<KindeIdToken>(idTokenEncoded);
    } catch (error) {
      if (config.isDebugMode) {
        console.error("setup: id token decode failed, redirecting to login");
      }
      return routerClient.json(
        { message: "ID_TOKEN_DECODE_FAILED", error },
        { status: 500 },
      );
    }

    if (!accessToken || !idToken) {
      return routerClient.json(
        { message: "TOKENS_MISSING", error: "No access or id token" },
        { status: 500 },
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
    });
  } catch (error) {
    if (config.isDebugMode) {
      console.error("setup: failed, error: ", error);
    }

    return routerClient.json(
      {
        message: "SETUP_FAILED",
        error,
      },
      { status: 500 },
    );
  }
};
