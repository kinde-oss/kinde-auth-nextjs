import { SESSION_PREFIX } from "../config/sessionPrefix";
import pkceChallenge from "./pkceChallenge";
import { randomString } from "./randomString";

var cookie = require("cookie");

export const setupChallenge = (req, res, maxAge) => {
  const state = randomString();
  const { code_challenge, code_verifier } = pkceChallenge();

  res.setHeader(
    "Set-Cookie",
    cookie.serialize(`${SESSION_PREFIX}-${state}`, code_verifier, {
      httpOnly: true,
      maxAge,
    })
  );
  return { state, code_challenge };
};
