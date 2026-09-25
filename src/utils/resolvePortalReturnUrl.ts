import { isRedirectAllowed } from "./isRedirectAllowed";

let hasWarnedUnvalidatedPortalReturnUrl = false;

const UNVALIDATED_PORTAL_RETURN_URL_WARNING =
  "Kinde: portal returnUrl is not being validated because KINDE_PORTAL_ALLOWED_RETURN_URL_REGEX is not set. This can allow an open redirect. Set KINDE_PORTAL_ALLOWED_RETURN_URL_REGEX to restrict allowed return URLs.";

export const resetUnvalidatedPortalReturnUrlWarning = () => {
  hasWarnedUnvalidatedPortalReturnUrl = false;
};

const warnUnvalidatedPortalReturnUrl = () => {
  if (hasWarnedUnvalidatedPortalReturnUrl) {
    return;
  }
  hasWarnedUnvalidatedPortalReturnUrl = true;
  console.warn(UNVALIDATED_PORTAL_RETURN_URL_WARNING);
};

export const resolvePortalReturnUrl = (
  requestedReturnUrl: string | null,
  fallbackReturnUrl: string,
  portalAllowedReturnUrlRegex: string | undefined,
) => {
  if (!requestedReturnUrl) {
    return fallbackReturnUrl;
  }

  if (!portalAllowedReturnUrlRegex) {
    warnUnvalidatedPortalReturnUrl();
    return requestedReturnUrl;
  }

  return isRedirectAllowed(requestedReturnUrl, portalAllowedReturnUrlRegex)
    ? requestedReturnUrl
    : fallbackReturnUrl;
};
