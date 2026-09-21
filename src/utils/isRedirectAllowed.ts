export const MAX_ALLOWED_REDIRECT_URL_LENGTH = 2048;

export const isRedirectAllowed = (
  url: string,
  allowedURLRegex?: string,
  maxLength?: number,
  regexName = "allowed URL regex",
) => {
  if (maxLength !== undefined && url.length > maxLength) {
    return false;
  }

  if (!allowedURLRegex) {
    return true;
  }

  let compiledRegex: RegExp;
  try {
    compiledRegex = new RegExp(allowedURLRegex);
  } catch (error) {
    console.error(`Invalid ${regexName} pattern:`, error);
    throw new Error(`Invalid ${regexName} pattern: ${error.message}`);
  }

  return compiledRegex.test(url);
};
