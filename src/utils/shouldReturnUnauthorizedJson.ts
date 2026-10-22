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
 * Next.js App Router `<Link>` / `router.push` are GET fetches (`RSC: 1`,
 * `Sec-Fetch-Dest: empty`, `Sec-Fetch-Mode: cors`), not document navigations.
 * Those must keep the login redirect rather than a JSON 401.
 */
const isNextAppRouterFetch = (
  headers: NonNullable<HeaderReadable["headers"]>,
): boolean => {
  if (headers.get("rsc")) {
    return true;
  }
  return Boolean(headers.get("next-router-state-tree"));
};

/**
 * Returns true when an unauthenticated request should receive a 401 JSON
 * response instead of a login redirect.
 *
 * Covers non-safe methods (POST, PUT, …) and fetch/XHR-style GETs that prefer
 * JSON or use CORS/`Sec-Fetch-Dest: empty`. Document navigations and Next.js
 * App Router RSC / router fetches still redirect.
 *
 * Older browsers (notably Safari) omit Sec-Fetch-* and most fetch() calls send
 * no Accept, so those GETs fall through to a login redirect instead of 401 JSON.
 */
export const shouldReturnUnauthorizedJson = (req: HeaderReadable): boolean => {
  if (isNonSafeMethod(req)) {
    return true;
  }

  const headers = req.headers;
  if (!headers?.get) {
    return false;
  }

  if (isNextAppRouterFetch(headers)) {
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

  // Last signal: Accept. Missing Sec-Fetch-* + no Accept → redirect (legacy).
  return prefersJsonOverHtml(headers.get("accept"));
};
