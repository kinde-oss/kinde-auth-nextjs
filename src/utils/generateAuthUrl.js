import {config} from '../config/index';
import {generateCallbackUrl} from '../utils/generateCallbackUrl';

export function generateAuthUrl(options, type = 'login') {
  const authUrl = new URL(config.issuerURL + config.issuerRoutes[type]);

  let searchParams = {
    redirect_uri: generateCallbackUrl(
      config.redirectURL,
      config.redirectRoutes.callback
    ),
    client_id: config.clientID,
    response_type: config.responseType,
    scope: config.scope,
    code_challenge: options.code_challenge,
    code_challenge_method: config.codeChallengeMethod,
    state: options.state,
    audience: config.audience
  };

  if (type === 'register') {
    searchParams.start_page = 'registration';
  }

  for (const [key, value] of Object.entries(options)) {
    if (key === 'kindeAuth') continue;
    if (value !== null && value !== undefined) {
      searchParams[key] = value;
    }
  }

  authUrl.search = new URLSearchParams(searchParams);
  return authUrl;
}
