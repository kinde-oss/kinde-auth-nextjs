import {
  KindeAccessToken,
  KindeIdToken,
  KindeOrganization,
  KindeProperties,
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
    idToken.organization_properties ||
    idToken["x-hasura-organization_properties"] ||
    {};
  const orgAccessTokenProperties =
    accessToken.organization_properties ||
    accessToken["x-hasura-organization_properties"] ||
    {};

  const combined: { t: "b" | "s" | "i"; value: unknown } = {
    ...orgIdTokenProperties,
    ...orgAccessTokenProperties,
  };

  const result: T = {} as T;
  Object.keys(combined).forEach((key) => {
    // console.log("key", key);
    if (combined[key].t === "b") {
      result[key] = combined[key].v as boolean;
    } else if (combined[key].t === "s") {
      result[key] = combined[key].v as string;
    } else {
      result[key] = combined[key].v as number;
    }
  });

  const orgProperties = {
    org_city: result["kp_org_city"],
    org_industry: result["industry"],
    org_postcode: result["postcode"],
    org_state_region: result["state_region"],
    org_street_address: result["street_address"],
    org_street_address_2: result["street_address_2"],
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
