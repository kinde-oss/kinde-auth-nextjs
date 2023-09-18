import jwt_decode from 'jwt-decode';
import {config} from '../../config/index';

const isTokenValid = (token) => {
  const accessToken = (token && token.access_token) || token;
  if (!accessToken) return false;

  const accessTokenHeader = jwt_decode(accessToken, {header: true});
  const accessTokenPayload = jwt_decode(accessToken);
  let isAudienceValid = true;
  if (config.audience) {
    isAudienceValid = accessTokenPayload.aud == config.audience;
  }
  console.log('aud', accessTokenPayload);
  console.log('aud', isAudienceValid);

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
