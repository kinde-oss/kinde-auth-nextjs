import pkceChallenge from "./pkceChallenge";
import { generateRandomString } from "@kinde-oss/kinde-auth-react/utils";

export const setupChallenge = () => {
  const state = generateRandomString();
  const { code_challenge, code_verifier } = pkceChallenge();

  return { state, code_challenge, code_verifier };
};
