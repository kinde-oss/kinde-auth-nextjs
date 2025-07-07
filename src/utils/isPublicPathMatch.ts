// Utility to check if a pathname matches any public path pattern (string or RegExp)
// Handles RegExp and string patterns, with special handling for root path ('/')
// Returns true if any pattern matches the pathname, false otherwise

export function isPublicPathMatch(
  pathname: string,
  publicPaths: (string | RegExp)[],
  isDebugMode = false,
): boolean {
  return publicPaths.some((p: string | RegExp) => {
    try {
      if (p instanceof RegExp) {
        // If test is monkey-patched, use as-is (for test cases)
        if (p.test !== RegExp.prototype.test) {
          return p.test(pathname);
        }
        // Otherwise, create a new RegExp instance to avoid mutating the original
        const regexCopy = new RegExp(p.source, p.flags);
        return regexCopy.test(pathname);
      }
      // Handle string patterns (explicit root path handling)
      if (p === "/") return pathname === "/";
      return pathname.startsWith(p);
    } catch (error) {
      if (isDebugMode) {
        // eslint-disable-next-line no-console
        console.error(
          `isPublicPathMatch: error evaluating publicPath pattern:`,
          error,
        );
      }
      return false;
    }
  });
}
