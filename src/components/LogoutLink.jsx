import { config, routes } from "../config/index";
import { publishSessionEvent } from "../frontend/sessionChannel";

/**
 * @typedef {Object} PropsType
 * @prop {React.ReactNode} children
 * @prop {string} [postLogoutRedirectURL]
 *
 * @typedef {PropsType & React.AnchorHTMLAttributes<HTMLAnchorElement>} Props
 */

/**
 * @param {Props} props
 */
export function LogoutLink({
  children,
  postLogoutRedirectURL,
  onClick,
  ...props
}) {
  const href = `${config.apiPath}/${routes.logout}${
    postLogoutRedirectURL
      ? `?post_logout_redirect_url=${postLogoutRedirectURL}`
      : ""
  }`;

  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        // This tab navigates to /logout, so we cannot wait for cookies to clear.
        // Other tabs ignore cookie-based revalidation until /setup reports
        // logged out (see useSessionSync).
        publishSessionEvent({ type: "logged_out" });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
