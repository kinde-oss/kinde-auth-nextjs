import { config } from "../../config/index";
import { GLOBAL_COOKIE_OPTIONS } from "../../session/sessionManager";

const cookie = require("cookie");

export const setVerifierCookie = (state, code_verifier, res, options) => {
  const jsonCookieValue = JSON.stringify({
    code_verifier,
    options,
  });

  res.setHeader(
    "Set-Cookie",
    cookie.serialize(`${config.SESSION_PREFIX}-${state}`, jsonCookieValue, {
      maxAge: 60 * 15,
      ...GLOBAL_COOKIE_OPTIONS,
    }),
  );
  return state;
};
