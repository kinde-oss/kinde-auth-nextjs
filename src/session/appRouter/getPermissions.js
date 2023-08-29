import { getClaim } from "./getClaim";

export const getPermissions = () => {
  const orgCode = getClaim("org_code");
  const permissions = getClaim("permissions");
  return {
    permissions,
    orgCode,
  };
};
