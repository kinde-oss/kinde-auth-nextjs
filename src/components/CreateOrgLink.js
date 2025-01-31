import React from "react";
import { config, routes } from "../config/index";

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
      href={`${config.apiPath}/${routes.createOrg}${
        orgName ? `?org_name=${orgName}` : ""
      }`}
      {...props}
    >
      {children}
    </a>
  );
}
