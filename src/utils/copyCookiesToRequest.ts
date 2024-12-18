import { RequestCookies } from "next/dist/server/web/spec-extension/cookies";

import { ResponseCookies } from "next/dist/server/web/spec-extension/cookies";
import { NextResponse } from "next/server";

import { NextRequest } from "next/server";

export const copyCookiesToRequest = (req: NextRequest, res: NextResponse) => {
  const setCookies = new ResponseCookies(res.headers);
  const newReqHeaders = new Headers(req.headers);
  const newReqCookies = new RequestCookies(newReqHeaders);
  setCookies.getAll().forEach((cookie) => newReqCookies.set(cookie));

  // NextResponse.next will set x-middleware-override-headers / x-middleware-request-* headers
  const dummyRes = NextResponse.next({ request: { headers: newReqHeaders } });

  dummyRes.headers.forEach((value, key) => {
    if (key === 'x-middleware-override-headers' || key.startsWith('x-middleware-request-')) {
      res.headers.set(key, value);
    }
  });
}