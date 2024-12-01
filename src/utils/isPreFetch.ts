import { NextRequest } from "next/server";

export function isPreFetch(req: NextRequest): boolean {
    const isPrefetch = req?.headers && (req?.headers.get('purpose') === 'prefetch' || 
        req?.headers.get('x-purpose') === 'prefetch' ||
        req?.headers.get('x-moz') === 'prefetch');

    return !!isPrefetch;
}