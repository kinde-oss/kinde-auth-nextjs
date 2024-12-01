import { NextRequest } from "next/server";

export function isPreFetch(req: NextRequest): boolean {
    const isPrefetch = req?.headers['purpose'] === 'prefetch' || 
        req?.headers['x-purpose'] === 'prefetch' ||
        req?.headers['x-moz'] === 'prefetch';

    return !!isPrefetch;
}