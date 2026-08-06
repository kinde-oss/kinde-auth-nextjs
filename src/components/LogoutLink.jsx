import { config, routes } from "../config/index";
import React from "react";
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
        // Notify other tabs before navigation clears this tab's cookies.
        publishSessionEvent({ type: "logged_out" });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
