export {default as getKindeServerSession} from '../session/index';
import {redirect} from 'next/navigation';

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

const protectPage =
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

export default protectPage;
