import kinde from "../session/index";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const redirectToAuth = ({ postLoginRedirectURL, orgCode }) => {
  const params = new URLSearchParams();
  let paramsObj = {};
  const kindeSiteUrl = process.env.KINDE_SITE_URL;
  if (!kindeSiteUrl) {
    throw new Error("KINDE_SITE_URL environment variable is not configured");
  }
  if (orgCode != null) paramsObj.org_code = orgCode;
  if (postLoginRedirectURL != null) {
    if (postLoginRedirectURL?.startsWith("/")) {
      postLoginRedirectURL = `${kindeSiteUrl}${postLoginRedirectURL}`;
    }
    paramsObj.post_login_redirect_url = postLoginRedirectURL;
  }

  for (const key in paramsObj) params.append(key, paramsObj[key]);

  const authUrl = new URL(
    `${kindeSiteUrl}/api/auth/login?${params.toString()}`
  );

  redirect(authUrl.toString());
};

/**
 * A higher-order function that wraps a page component and adds protection logic.
 * @param {import('react').ReactNode} page - The page component to be protected.
 * @param {Object} config - The configuration options for the protection logic.
 * @param {string} config.postLoginRedirectURL - The redirect URL after the user logs in.
 * @param {string} config.orgCode - The redirect URL after the user logs in.
 * @param {string[]} config.roles - The required role(s) for accessing the protected page.
 * @param {string|string[]} config.permissions - The required permission(s) for accessing the protected page.

 * @returns {Function} - The protected page component.
 */

export const protectPage =
  (Page, config = {}) =>
  async (props) => {
    const { isAuthenticated, getPermission, getPermissions, getRoles } =
      kinde();

    const isSignedIn = await isAuthenticated();

    if (!isSignedIn) {
      redirectToAuth(config);
    }

    if (config.roles) {
      const roles = await getRoles();
      if (!roles) redirectToAuth(config);
      const roleNames = new Set(roles.map((r) => r.name));
      if (!config.roles.some((role) => roleNames.has(role))) {
        redirectToAuth(config);
      }
    }

    if (typeof config.permissions === "string") {
      const hasPermission = await getPermission(config.permissions);
      if (!hasPermission) {
        redirectToAuth(config);
      }
    }

    if (Array.isArray(config.permissions)) {
      const permissions = await getPermissions();
      if (
        !config.permissions.some((permission) =>
          permissions.includes(permission)
        )
      ) {
        redirectToAuth(config);
      }
    }

    return Page(props);
  };

/**
 * Protects a Next.js API route handler with authentication and authorization.
 * @param {Function} handler - The Next.js API route handler.
 * @param {Object} config - The configuration object.
 * @param {string[]} config.roles - The required role(s) for accessing the protected page.
 * @param {string|string[]} config.permissions - The required permission(s) for accessing the protected page.
 * @returns {Function} - The protected API route handler.
 */

export const protectApi = (handler, config) => async (req) => {
  const { isAuthenticated, getPermission, getPermissions, getRoles } = kinde();
  try {
    const isSignedIn = await isAuthenticated();

    if (!isSignedIn) {
      return NextResponse.json({ statusCode: 401, message: "Unauthorized" });
    }

    if (config.roles) {
      const roles = await getRoles();
      if (!roles)
        return NextResponse.json({ statusCode: 401, message: "Unauthorized" });
      const roleNames = new Set(roles.map((r) => r.name));
      if (!config.roles.some((role) => roleNames.has(role))) {
        return NextResponse.json({ statusCode: 401, message: "Unauthorized" });
      }
    }

    if (typeof config.permissions === "string") {
      const hasPermission = await getPermission(config.permissions);
      if (!hasPermission) {
        return NextResponse.json({ statusCode: 403, message: "Forbidden" });
      }
    }

    if (Array.isArray(config.permissions)) {
      const permissions = await getPermissions();
      if (
        !config.permissions.some((permission) =>
          permissions.includes(permission)
        )
      ) {
        return NextResponse.json({ statusCode: 403, message: "Forbidden" });
      }
    }
  } catch (error) {
    console.error("Error protecting page", error);
    return null;
  }

  return handler(req);
};
