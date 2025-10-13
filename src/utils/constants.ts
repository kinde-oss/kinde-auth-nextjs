import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const TWENTY_NINE_DAYS = 2505600;

export const GLOBAL_COOKIE_OPTIONS: Partial<ResponseCookie> = {
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const COOKIE_LIST = [
  "ac-state-key",
  "id_token_payload",
  "id_token",
  "access_token_payload",
  "access_token",
  "user",
  "refresh_token",
  "post_login_redirect_url",
];

export const MAX_COOKIE_LENGTH = 3000;

export const ACTIVITY_COOKIE_NAME = "kinde_activity_ts";
