/**
 * Returns true when the HTTP method is not safe/idempotent (i.e. not GET or HEAD).
 *
 * Browsers automatically follow 3xx redirects for GET/HEAD, but non-safe methods
 * (POST, PUT, PATCH, DELETE, …) cannot be transparently redirected to the login page.
 * Callers should return a 401 JSON response instead of a redirect for these methods.
 */
export const isNonSafeMethod = (req: { method?: string }): boolean => {
  const method = req.method?.toUpperCase() ?? "GET";
  return method !== "GET" && method !== "HEAD";
};
