import { loginUrl } from "../config/urls";
import { setupChallenge } from "../utils/setupChallenge";

export const login = async (req, res) => {
  const { state, code_challenge } = setupChallenge(req, res);
  loginUrl.searchParams.set("state", state);
  loginUrl.searchParams.set("code_challenge", code_challenge);
  loginUrl.searchParams.set("code_challenge_method", "S256");

  res.redirect(loginUrl.href);
};
