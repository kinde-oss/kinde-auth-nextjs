import RouterClient from '../routerClients/RouterClient';
import { config } from '../config/index'
import { NextResponse } from "next/server";

/**
 * 
 * @returns NextResponse
 */
export const health = async () => {
  return NextResponse.json({
    apiPath: config.apiPath,
    redirectURL: config.clientOptions.redirectURL,
    postLoginRedirectURL: config.postLoginRedirectURL,
    issuerURL:  config.issuerURL,
    clientID:  config.clientID,
    clientSecret:  config.clientSecret.match('[a-z0-9]{32}') ? 'Set correctly' : 'Not set correctly',
    postLogoutRedirectURL:  config.postLogoutRedirectURL,
    audience: config.audience,
    cookieDomain: config.cookieDomain,
    logoutRedirectURL: config.clientOptions.logoutRedirectURL
  });
};
