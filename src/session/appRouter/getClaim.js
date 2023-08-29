import {getAccessToken} from './getAccessToken';
import {getIdToken} from './getIdToken';

export const getClaim = (claim) => {
  const accessToken = getAccessToken();
  return accessToken ? accessToken[claim] : null;
};

export const getClaimFromIdToken = (claim) => {
  const idToken = getIdToken();
  return idToken ? idToken[claim] : null;
};
