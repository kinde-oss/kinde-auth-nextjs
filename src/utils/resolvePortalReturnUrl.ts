import { isRedirectAllowed } from "./isRedirectAllowed";

let hasWarnedUnvalidatedPortalReturnUrl = false;

const PORTAL_RETURN_URL_DOCS_URL =
  "https://docs.kinde.com/developer-tools/sdks/backend/nextjs-sdk/#portal-return-url";

const UNVALIDATED_PORTAL_RETURN_URL_WARNING =
  "[kinde-auth-nextjs] KINDE_PORTAL_ALLOWED_RETURN_URL_REGEX is not configured. " +
  "The portal's `returnUrl` query parameter is not being validated against an allowlist, " +
  "which permits the portal to redirect to an arbitrary external URL (open redirect vulnerability). " +
  "Configure KINDE_PORTAL_ALLOWED_RETURN_URL_REGEX to restrict allowed return URLs. " +
  `See: ${PORTAL_RETURN_URL_DOCS_URL}`;

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
