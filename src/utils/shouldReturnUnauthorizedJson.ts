import { isNonSafeMethod } from "./isNonSafeMethod";

type HeaderReadable = {
  method?: string;
  headers?: {
    get?: (name: string) => string | null;
  };
};

/**
 * True when `Accept` lists `application/json` before (or without) `text/html`,
 * which is typical of fetch/XHR API clients rather than document navigations.
 */
const prefersJsonOverHtml = (accept: string | null | undefined): boolean => {
  if (!accept) return false;
  const normalized = accept.toLowerCase();
  const jsonIndex = normalized.indexOf("application/json");
  if (jsonIndex === -1) return false;
  const htmlIndex = normalized.indexOf("text/html");
  if (htmlIndex === -1) return true;
  return jsonIndex < htmlIndex;
};

/**
 * Returns true when an unauthenticated request should receive a 401 JSON
 * response instead of a login redirect.
 *
 * Covers non-safe methods (POST, PUT, …) and fetch/XHR-style GETs that prefer
 * JSON or use CORS/`Sec-Fetch-Dest: empty`. Document navigations still redirect.
 */
export const shouldReturnUnauthorizedJson = (req: HeaderReadable): boolean => {
  if (isNonSafeMethod(req)) {
    return true;
  }

  const headers = req.headers;
  if (!headers?.get) {
    return false;
  }

  const secFetchDest = headers.get("sec-fetch-dest")?.toLowerCase();
  if (secFetchDest === "empty") {
    return true;
  }

  const secFetchMode = headers.get("sec-fetch-mode")?.toLowerCase();
  if (secFetchMode === "cors") {
    return true;
  }

  return prefersJsonOverHtml(headers.get("accept"));
};
