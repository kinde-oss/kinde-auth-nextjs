export const isRedirectAllowed = (
  url: string,
  allowedURLRegex: string | undefined,
) => {
  if (!allowedURLRegex) {
    return true;
  }

  let compiledRegex: RegExp;
  try {
    compiledRegex = new RegExp(allowedURLRegex);
  } catch (error) {
    console.error("Invalid postLoginAllowedURLRegex pattern:", error);
    throw new Error(
      `Invalid postLoginAllowedURLRegex pattern: ${error.message}`,
    );
  }

  return compiledRegex.test(url);
};
