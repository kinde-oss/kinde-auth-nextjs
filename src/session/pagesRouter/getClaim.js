import {getAccessToken} from './getAccessToken';
import {getIdToken} from './getIdToken';

export const getClaim = (req, res, claim) => {
  const accessToken = getAccessToken(req, res);
  return accessToken ? accessToken[claim] : null;
};

export const getClaimFromIdToken = (req, res, claim) => {
  const idToken = getIdToken(req, res);
  return idToken ? idToken[claim] : null;
};
