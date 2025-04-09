import {
  KindeAccessToken,
  KindeIdToken,
  KindeOrganization,
  KindeProperties,
  KindeProperty,
} from "../types";
import removeUndefined from "./removeUndefined";

type OrgPropertyKey =
  | "city"
  | "industry"
  | "postcode"
  | "state_region"
  | "street_address"
  | "street_address_2";

const getOrgProperties = <T = KindeProperties>(
  idToken: KindeIdToken,
  accessToken: KindeAccessToken,
): T | undefined => {
  const orgIdTokenProperties =
    (idToken.organization_properties ||
    idToken["x-hasura-organization_properties"] ||
    {}) as KindeProperty
  const orgAccessTokenProperties =
    (accessToken.organization_properties ||
    accessToken["x-hasura-organization_properties"] ||
    {}) as KindeProperty

  const combined: KindeProperty = {
    ...orgIdTokenProperties,
    ...orgAccessTokenProperties,
  };

  const result: T = {} as T;
  Object.keys(combined).forEach((key) => {

    if (combined[key].t === "b") {
      result[key] = combined[key].v as boolean;
    } else if (combined[key].t === "s") {
      result[key] = combined[key].v as string;
    } else {
      result[key] = combined[key].v as number;
    }
  });

  const orgProperties = {
    // Keep the original keys for backwards compatibility
    // will be deprecated in the future
    city: result["kp_org_city"],
    industry: result["kp_org_industry"],
    postcode: result["kp_org_postcode"],
    state_region: result["kp_org_state_region"],
    street_address: result["kp_org_street_address"],
    street_address_2: result["kp_org_street_address_2"],
    ...result,
  };

  return removeUndefined<T>(orgProperties);
};

export const generateOrganizationObject = <T = KindeProperties>(
  idToken: KindeIdToken,
  accessToken: KindeAccessToken,
): KindeOrganization<T> | null => {
  const orgCode = accessToken.org_code || accessToken["x-hasura-org-code"];
  const orgName = accessToken.org_name || accessToken["x-hasura-org-name"];
  if (!orgCode) {
    return null;
  }

  return {
    orgCode,
    orgName,
    properties: getOrgProperties<T>(idToken, accessToken),
  };
};
