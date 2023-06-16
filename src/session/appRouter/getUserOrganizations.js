import { getClaimFromIdToken } from "./getClaim";

export const getUserOrganizations = (req) => {
  const orgCodes = getClaimFromIdToken(req, "org_codes");
  return {
    orgCodes,
  };
};
