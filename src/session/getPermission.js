import { getClaim } from "./getClaim";

export const getPermission = (req, res, key) => {
  const orgCode = getClaim(req, res, "org_code");
  const permissions = getClaim(req, res, "permissions") || [];
  return {
    isGranted: permissions.some((p) => p === key),
    orgCode,
  };
};
