import {
  RequestCookies,
  ResponseCookies,
} from "next/dist/server/web/spec-extension/cookies.js";
// Keep .js extension - upstream issue, see https://github.com/vercel/next.js/pull/64529
import { NextRequest, NextResponse } from "next/server.js";

export const copyCookiesToRequest = (req: NextRequest, res: NextResponse) => {
  const setCookies = new ResponseCookies(res.headers);
  const newReqHeaders = new Headers(req.headers);
  const newReqCookies = new RequestCookies(newReqHeaders);
  setCookies.getAll().forEach((cookie) => newReqCookies.set(cookie));

  // NextResponse.next will set x-middleware-override-headers / x-middleware-request-* headers
  const dummyRes = NextResponse.next({ request: { headers: newReqHeaders } });

  dummyRes.headers.forEach((value, key) => {
    if (
      key === "x-middleware-override-headers" ||
      key.startsWith("x-middleware-request-")
    ) {
      res.headers.set(key, value);
    }
  });
};
