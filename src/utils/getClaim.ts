import {KindeAccessToken, KindeIdToken} from '../../types';

interface GetClaimParams {
  accessToken: KindeAccessToken;
  idToken: KindeIdToken;
  claim: string;
}

export const getClaim = ({accessToken, claim, idToken}: GetClaimParams) => {
  let hasuraClaim = 'x-hasura-' + claim;
  if (claim === 'org_name') {
    hasuraClaim = 'x-hasura-org-name';
  }
  if (claim === 'org_code') {
    hasuraClaim = 'x-hasura-org-code';
  }
  if (claim === 'org_codes') {
    hasuraClaim = 'x-hasura-org-codes';
  }

  if (idToken[claim]) {
    return idToken[claim];
  }

  if (idToken[hasuraClaim]) {
    return idToken[hasuraClaim];
  }

  if (accessToken[claim]) {
    return accessToken[claim];
  }

  if (accessToken[hasuraClaim]) {
    return accessToken[hasuraClaim];
  }

  return null;
};
