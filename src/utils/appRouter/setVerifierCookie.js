import { config } from "../../config/index";
// Keep .js extension - upstream issue, see https://github.com/vercel/next.js/pull/64529
import { cookies } from "next/headers.js";
import { GLOBAL_COOKIE_OPTIONS } from "../../session/sessionManager";

export const setVerifierCookie = async (state, code_verifier, options) => {
  (await cookies()).set({
    name: `${config.SESSION_PREFIX}-${state}`,
    value: JSON.stringify({ code_verifier, options }),
    maxAge: 60 * 15,
    ...GLOBAL_COOKIE_OPTIONS,
  });
};
