export function isPreFetch(headers: Headers): boolean {
  return (
    headers.get("purpose") === "prefetch" ||
    headers.get("x-purpose") === "prefetch" ||
    headers.get("x-moz") === "prefetch" ||
    headers.get("next-router-prefetch") === "1"
  );
}
