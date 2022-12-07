import { getClaimFromIdToken } from "./getClaim";

export const getUserOrganizations = (req, res) => {
  const orgCodes = getClaimFromIdToken(req, res, "org_codes");
  return {
    orgCodes,
  };
};
