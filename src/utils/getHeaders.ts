import { NextApiRequest } from "next";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { NextRequest } from "next/server";

export const getHeaders = async (req?: NextRequest | NextApiRequest) => {
    if(req) {
        // pages router, or we've provided a request down on app router for some reason
        return new Headers(req.headers as HeadersInit)
    } else {
        try { 
            // dynamically import headers on app router environments in Next >=13 (it didn't exist prior to 13)
            const { headers } = await import('next/headers')
            const heads = await headers()
            return heads
        } catch (error) {
            throw new Error(`Kinde: Failed to read request headers (are you using a Next.js version prior to 13?)`)
        }
    }
};
