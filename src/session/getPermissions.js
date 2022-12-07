import { getClaim } from "./getClaim";

export const getPermissions = (req, res) => {
  const orgCode = getClaim(req, res, "org_code");
  const permissions = getClaim(req, res, "permissions");
  return {
    permissions,
    orgCode,
  };
};
