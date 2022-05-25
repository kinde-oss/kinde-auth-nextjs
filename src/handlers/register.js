import { registerUrl } from "../config/urls";
import { setupChallenge } from "../utils/setupChallenge";

export const register = async (req, res) => {
  const { state, code_challenge } = setupChallenge(req, res, 180);
  registerUrl.searchParams.set("state", state);
  registerUrl.searchParams.set("code_challenge", code_challenge);
  registerUrl.searchParams.set("code_challenge_method", "S256");

  res.redirect(registerUrl.href);
};
