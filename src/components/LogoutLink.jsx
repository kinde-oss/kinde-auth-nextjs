import { config, routes } from "../config/index";
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
export function LogoutLink({ children, postLogoutRedirectURL, ...props }) {
  return (
    <a
      href={`${config.apiPath}/${routes.logout}${
        postLogoutRedirectURL
          ? `?post_logout_redirect_url=${postLogoutRedirectURL}`
          : ""
      }`}
      {...props}
    >
      {children}
    </a>
  );
}
