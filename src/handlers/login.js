import { config } from "../config/index";
import { setupChallenge } from "../utils/setupChallenge";

export const login = async (req, res) => {
  const options = req.query;
  const { org_code, is_create_org, org_name = "" } = options;

  const { state, code_challenge } = setupChallenge(req, res, 60 * 15);

  const loginURL = new URL(config.issuerURL + config.issuerRoutes.login);

  let searchParams = {
    redirect_uri: config.redirectURL + config.redirectRoutes.callback,
    client_id: config.clientID,
    response_type: config.responseType,
    scope: config.scope,
    code_challenge,
    code_challenge_method: config.codeChallengeMethod,
    state,
    start_page: "login",
  };

  if (org_code) {
    searchParams.org_code = org_code;
  }

  if (is_create_org) {
    searchParams.is_create_org = is_create_org;
    searchParams.org_name = org_name;
  }

  if (config.audience) {
    searchParams.audience = config.audience;
  }

  loginURL.search = new URLSearchParams(searchParams);

  res.redirect(loginURL.href);
};
