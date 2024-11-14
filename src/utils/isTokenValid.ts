import {jwtDecoder, TokenPart} from '@kinde/jwt-decoder';
import {config} from '../config/index';

const isTokenValid = (token) => {
  const accessToken = token?.access_token ?? token;
  if (!accessToken) return false;

  const accessTokenHeader = jwtDecoder(accessToken, TokenPart.header);
  const accessTokenPayload = jwtDecoder(accessToken);
  let isAudienceValid = true;
  if (config.audience)
    if (Array.isArray(config.audience)) {
      isAudienceValid =
        Array.isArray(accessTokenPayload.aud) &&
        config.audience.some((aud) => accessTokenPayload.aud?.includes(aud));
    } else if (typeof config.audience === 'string') {
      isAudienceValid =
        Array.isArray(accessTokenPayload.aud) &&
        accessTokenPayload.aud.includes(config.audience);
    }

  if (
    accessTokenPayload.iss == config.issuerURL &&
    accessTokenHeader.alg == 'RS256' &&
    accessTokenPayload.exp > Math.floor(Date.now() / 1000) &&
    isAudienceValid
  ) {
    return true;
  } else {
    return false;
  }
};

export {isTokenValid};
