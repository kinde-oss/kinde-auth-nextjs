import { randomString } from "./randomString";
import { SESSION_PREFIX } from "../config/sessionPrefix";
var cookie = require("cookie");

export const setupChallenge = () => {
  const state = randomString();
  const code_verifier = randomString(); // the secret
  // Hash and base64-urlencode the secret to use as the challenge
  const code_challenge = "await pkceChallengeFromVerifier(code_verifier)";

  cookie.parse(`${SESSION_PREFIX}-${state}`, code_verifier);

  // Build and encode the authorisation request url
  const url = new URL(config.authorization_endpoint);
  return { state, code_challenge, url };
};
