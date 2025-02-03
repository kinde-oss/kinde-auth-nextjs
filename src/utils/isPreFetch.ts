export function isPreFetch(headers: Headers): boolean {
  const isPrefetch =
    headers.get("purpose") === "prefetch" ||
    headers.get("x-purpose") === "prefetch" ||
    headers.get("x-moz") === "prefetch";

  return !!isPrefetch;
}
