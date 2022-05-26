import { config } from "../config/index";
import { setupChallenge } from "../utils/setupChallenge";

export const register = async (req, res) => {
  const { state, code_challenge } = setupChallenge(req, res, 180);
  const registerURL = new URL(config.issuerURL + config.issuerRoutes.register);

  registerURL.searchParams.append("response_type", config.responseType);
  registerURL.searchParams.append("client_id", config.clientID);
  registerURL.searchParams.append(
    "redirect_uri",
    config.redirectURL + config.redirectRoutes.callback
  );
  registerURL.searchParams.append("scope", config.scope);
  registerURL.searchParams.append("start_page", "registration");

  registerURL.searchParams.set("state", state);
  registerURL.searchParams.set("code_challenge", code_challenge);
  registerURL.searchParams.set(
    "code_challenge_method",
    config.codeChallengeMethod
  );

  res.redirect(registerURL.href);
};
