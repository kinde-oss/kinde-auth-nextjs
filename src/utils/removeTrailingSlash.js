export function removeTrailingSlash(url) {
  if (url === undefined) return url;

  url = url.trim();

  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  return url;
}
