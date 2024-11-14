import {KindeAccessToken, KindeIdToken} from '../../types';

interface GetClaimParams {
  accessToken: KindeAccessToken;
  idToken: KindeIdToken;
  claim: string;
}

export const getClaim = ({accessToken, claim, idToken}: GetClaimParams) => {
  const claimMappings = {
    org_name: 'x-hasura-org-name',
    org_code: 'x-hasura-org-code',
    org_codes: 'x-hasura-org-codes'
  };

  const hasuraClaim = claimMappings[claim] || `x-hasura-${claim}`;

  if (claim in idToken && idToken[claim] !== undefined) {
    return idToken[claim];
  }

  if (hasuraClaim in idToken && idToken[hasuraClaim] !== undefined) {
    return idToken[hasuraClaim];
  }

  if (claim in accessToken && accessToken[claim] !== undefined) {
    return accessToken[claim];
  }

  if (hasuraClaim in accessToken && accessToken[hasuraClaim] !== undefined) {
    return accessToken[hasuraClaim];
  }

  return null;
};
