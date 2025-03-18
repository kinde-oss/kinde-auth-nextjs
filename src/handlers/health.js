import { config } from "../config/index";
import { NextResponse } from "next/server.js";
import { validateClientSecret } from "@kinde-oss/kinde-typescript-sdk";

/**
 *
 * @returns NextResponse
 */
export const health = async () => {
  return NextResponse.json({
    apiPath: config.apiPath,
    redirectURL: config.clientOptions.redirectURL,
    postLoginRedirectURL: config.postLoginRedirectURL,
    issuerURL: config.issuerURL,
    clientID: config.clientID,
    clientSecret: validateClientSecret(config.clientSecret)
      ? "Set correctly"
      : "Not set correctly",
    postLogoutRedirectURL: config.postLogoutRedirectURL,
    audience: config.audience,
    cookieDomain: config.cookieDomain,
    logoutRedirectURL: config.clientOptions.logoutRedirectURL,
  });
};
