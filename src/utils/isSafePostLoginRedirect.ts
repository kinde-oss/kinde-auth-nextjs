const isAbsoluteHttpUrl = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://");

/**
 * Decides whether a post-login redirect may leave the callback.
 * The server-configured default is trusted. A value taken from the
 * login query string must stay on the site origin, or match the
 * customer allowlist.
 */
export const isSafePostLoginRedirect = ({
  raw,
  siteUrl,
  allowedURLRegex,
  isServerConfiguredDefault,
}: {
  raw: string;
  siteUrl: string;
  allowedURLRegex?: string | null;
  isServerConfiguredDefault: boolean;
}): boolean => {
  let compiledRegex: RegExp | null = null;
  if (allowedURLRegex) {
    try {
      compiledRegex = new RegExp(allowedURLRegex);
    } catch (error) {
      console.error("Invalid postLoginAllowedURLRegex pattern:", error);
      throw new Error(
        `Invalid postLoginAllowedURLRegex pattern: ${error.message}`,
      );
    }
  }

  if (isServerConfiguredDefault) {
    return true;
  }

  if (!raw || raw.startsWith("//") || raw.includes("\\")) {
    return false;
  }

  let target: URL;
  try {
    target = isAbsoluteHttpUrl(raw) ? new URL(raw) : new URL(raw, siteUrl);
  } catch {
    return false;
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return false;
  }

  let siteOrigin: string;
  try {
    siteOrigin = new URL(siteUrl).origin;
  } catch {
    return false;
  }

  if (target.origin === siteOrigin) {
    return true;
  }

  return compiledRegex?.test(target.toString()) ?? false;
};

export const toPostLoginRedirectUrl = (raw: string, siteUrl: string): URL => {
  return isAbsoluteHttpUrl(raw) ? new URL(raw) : new URL(raw, siteUrl);
};
