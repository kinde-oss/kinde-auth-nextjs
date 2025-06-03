import React from "react";
import { config, routes } from "../config/index";
import { GeneratePortalUrlParams } from "@kinde/js-utils";

export interface PortalLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    Partial<Omit<GeneratePortalUrlParams, "domain">> {
  children: React.ReactNode;
}

export function PortalLink({
  subNav,
  returnUrl,
  children,
  ...props
}: PortalLinkProps) {
  const params = new URLSearchParams();

  if (subNav !== undefined) {
    params.append("subNav", subNav);
  }

  if (returnUrl !== undefined) {
    params.append("returnUrl", returnUrl);
  }

  const paramsString = params.toString();
  const portalUrl = `${config.apiPath}/${routes.portal}${
    paramsString ? `?${paramsString}` : ""
  }`;

  return (
    portalUrl && (
      <a href={portalUrl} {...props}>
        {children}
      </a>
    )
  );
}
