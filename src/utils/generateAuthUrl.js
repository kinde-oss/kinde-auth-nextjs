import { config } from "../config/index";
import { generateCallbackUrl } from "../utils/generateCallbackUrl";

export function generateAuthUrl(options, type = "login") {
  const { org_code, is_create_org, org_name = "", login_hint } = options;
  const authUrl = new URL(config.issuerURL + config.issuerRoutes[type]);

  let searchParams = {
    redirect_uri: generateCallbackUrl(
      config.redirectURL,
      config.redirectRoutes.callback,
    ),
    client_id: config.clientID,
    response_type: config.responseType,
    scope: config.scope,
    code_challenge: options.code_challenge,
    code_challenge_method: config.codeChallengeMethod,
    state: options.state,
  };

  if (type === "register") {
    searchParams.start_page = "registration";
  }

  if (org_code) {
    searchParams.org_code = org_code;
  }

  if (login_hint) {
    searchParams.login_hint = login_hint;
  }

  if (is_create_org) {
    searchParams.is_create_org = is_create_org;
    searchParams.org_name = org_name;
  }

  if (config.audience) {
    searchParams.audience = config.audience;
  }

  authUrl.search = new URLSearchParams(searchParams);
  return authUrl;
}
