import {getAccessToken} from './getAccessToken';
import {getIdToken} from './getIdToken';

export const getClaim = (request, claim) => {
  const accessToken = getAccessToken(request);
  return accessToken ? accessToken[claim] : null;
};

export const getClaimFromIdToken = (request, claim) => {
  const idToken = getIdToken(request);
  return idToken ? idToken[claim] : null;
};
