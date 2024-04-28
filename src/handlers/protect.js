export {default as getKindeServerSession} from '../session/index';
import {redirect} from 'next/navigation';
import {NextResponse} from 'next/server';

/**
 * A higher-order function that wraps a page component and adds protection logic.
 * @param {import('react').ReactNode} page - The page component to be protected.
 * @param {Object} config - The configuration options for the protection logic.
 * @param {string} config.redirect - The redirect path if the user is not authenticated or does not have the required role or permissions.
 * @param {string[]} config.role - The required role(s) for accessing the protected page.
 * @param {string|string[]} config.permissions - The required permission(s) for accessing the protected page.
 * @param {number} config.statusCode - The status code for the redirect response.
 * @returns {Function} - The protected page component.
 */

export const protectPage =
  (page, config = {redirect: '/api/auth/login', statusCode: 302}) =>
  async (props) => {
    const {isAuthenticated, getAccessToken, getPermission, getPermissions} =
      kinde();
    try {
      const isSignedIn = await isAuthenticated();

      if (!isSignedIn) {
        return redirect(config.redirect, {statusCode});
      }

      if (config.role) {
        const token = await getAccessToken();
        const roles = token?.roles;
        if (!roles || !config.role.some((role) => roles.includes(role))) {
          return redirect(config.redirect, {statusCode});
        }
      }

      if (typeof config.permissions === 'string') {
        const hasPermission = await getPermission(config.permissions);
        if (!hasPermission) {
          return redirect(config.redirect, {statusCode});
        }
      }

      if (Array.isArray(config.permissions)) {
        const permissions = await getPermissions();
        if (
          !config.permissions.some((permission) =>
            permissions.includes(permission)
          )
        ) {
          return redirect(config.redirect, {statusCode});
        }
      }
    } catch (error) {
      // return redirect(config.redirect, {statusCode});
      console.error('Error protecting page', error);
      return null;
    }

    return page(props);
  };

/**
 * Protects a Next.js API route handler with authentication and authorization.
 * @param {Function} handler - The Next.js API route handler.
 * @param {Object} config - The configuration object.
 * @param {string[]} config.role - The required role(s) for accessing the protected page.
 * @param {string|string[]} config.permissions - The required permission(s) for accessing the protected page.
 * @returns {Function} - The protected API route handler.
 */

export const protectApi = (handler, config) => async (req) => {
  const {isAuthenticated, getAccessToken, getPermission, getPermissions} =
    kinde();
  try {
    const isSignedIn = await isAuthenticated();

    if (!isSignedIn) {
      return NextResponse.json({statusCode: 401, message: 'Unauthorized'});
    }

    if (config.role) {
      const token = await getAccessToken();
      const roles = token?.roles;
      if (!roles || !config.role.some((role) => roles.includes(role))) {
        return res.redirect({statusCode: 403, message: 'Forbidden'});
      }
    }

    if (typeof config.permissions === 'string') {
      const hasPermission = await getPermission(config.permissions);
      if (!hasPermission) {
        return NextResponse.json({statusCode: 403, message: 'Forbidden'});
      }
    }

    if (Array.isArray(config.permissions)) {
      const permissions = await getPermissions();
      if (
        !config.permissions.some((permission) =>
          permissions.includes(permission)
        )
      ) {
        return NextResponse.json({statusCode: 403, message: 'Forbidden'});
      }
    }
  } catch (error) {
    // return NextResponse.json({
    //   statusCode: 500,
    //   message: 'Internal Server Error'
    // });
    console.error('Error protecting page', error);
    return null;
  }

  return handler(req);
};
