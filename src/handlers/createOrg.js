import {config} from '../config/index';
import {setupChallenge} from '../utils/setupChallenge';

export const createOrg = async (req, res) => {
  const options = req.query;
  const {org_name = '', start_page = 'registration'} = options;

  const {state, code_challenge} = setupChallenge(req, res, 60 * 15);

  const createOrgURL = new URL(config.issuerURL + config.issuerRoutes.login);

  let searchParams = {
    redirect_uri: config.redirectURL + config.redirectRoutes.callback,
    client_id: config.clientID,
    response_type: config.responseType,
    scope: config.scope,
    code_challenge,
    code_challenge_method: config.codeChallengeMethod,
    state,
    start_page: start_page,
    is_create_org: true,
    org_name
  };

  if (config.audience) {
    searchParams.audience = config.audience;
  }

  createOrgURL.search = new URLSearchParams(searchParams);

  res.redirect(createOrgURL.href);
};
