import pkceChallenge from "./pkceChallenge";
import { randomString } from "./randomString";

export const setupChallenge = (req, res) => {
  const state = randomString();
  const { code_challenge, code_verifier } = pkceChallenge();

  return { state, code_challenge, code_verifier };
};
