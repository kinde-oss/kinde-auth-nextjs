import { config } from "../config/index";
import { setupChallenge } from "../utils/setupChallenge";

export const login = async (req, res) => {
  const { state, code_challenge } = setupChallenge(req, res, 60);
  const loginURL = new URL(config.issuerURL + config.issuerRoutes.login);

  loginURL.searchParams.append("response_type", config.responseType);
  loginURL.searchParams.append("client_id", config.clientID);
  loginURL.searchParams.append(
    "redirect_uri",
    config.redirectURL + config.redirectRoutes.callback
  );
  loginURL.searchParams.append("scope", config.scope);

  loginURL.searchParams.set("state", state);
  loginURL.searchParams.set("code_challenge", code_challenge);
  loginURL.searchParams.set(
    "code_challenge_method",
    config.codeChallengeMethod
  );

  console.log(loginURL);

  res.redirect(loginURL.href);
};
