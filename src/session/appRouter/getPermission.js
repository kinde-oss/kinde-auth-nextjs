import { getClaim } from "./getClaim";

export const getPermission = (key) => {
  const orgCode = getClaim("org_code");
  const permissions = getClaim("permissions") || [];
  return {
    isGranted: permissions.some((p) => p === key),
    orgCode,
  };
};
