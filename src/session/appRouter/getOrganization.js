import { getClaim } from "./getClaim";

export const getOrganization = () => {
  const orgCode = getClaim("org_code");
  return {
    orgCode,
  };
};
