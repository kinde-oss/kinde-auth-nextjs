import React from "react";

import { config } from "../config/index";
/**
 * @typedef {Object} PropsType
 * @prop {React.ReactNode} children
 * @prop {string} [orgName]
 *
 * @typedef {PropsType & React.AnchorHTMLAttributes<HTMLAnchorElement>} Props
 */

/**
 * @param {Props} props
 */
export function CreateOrgLink({ children, orgName, ...props }) {
  return (
    <a
      href={`${config.apiPath}/${process.env.KINDE_AUTH_CREATEORG_ROUTE || 'createorg'}${
        orgName ? `?org_name=${orgName}` : ""
      }`}
      {...props}
    >
      {children}
    </a>
  );
}
