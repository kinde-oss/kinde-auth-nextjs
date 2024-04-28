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
  (page, config = {redirect: '/api/login', statusCode: 302}) =>
  async (props) => {
    const {isAuthenticated, getAccessToken, getPermission} = kinde();
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
      const hasPermission = await Promise.all(
        config.permissions.map((permission) => getPermission(permission))
      );
      if (!hasPermission.some((permission) => permission)) {
        return redirect(config.redirect, {statusCode});
      }
    }

    return page(props);
  };

export default protectPage;
