export function removeTrailingSlash(url) {
  if (url === undefined || url === null) return undefined;

  url = url.trim();

  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }

  return url;
}
