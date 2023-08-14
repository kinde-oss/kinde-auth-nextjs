import {getClaimFromIdToken} from './getClaim';

export const getUserOrganizations = (req) => {
  const orgCodes = getClaimFromIdToken('org_codes');
  return {
    orgCodes
  };
};
