import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

export function isPreFetch(headers: ReadonlyHeaders): boolean {
    const isPrefetch = headers.get('purpose') === 'prefetch' || 
        headers.get('x-purpose') === 'prefetch' ||
        headers.get('x-moz') === 'prefetch';

    return !!isPrefetch;
}