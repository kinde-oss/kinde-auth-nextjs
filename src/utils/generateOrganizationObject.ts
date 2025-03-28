import { KindeAccessToken, KindeIdToken, KindeOrganization } from "../types";

type OrgPropertyKey =
  | "city"
  | "industry"
  | "postcode"
  | "state_region"
  | "street_address"
  | "street_address_2";

const getOrgProperty = (
  key: OrgPropertyKey,
  idToken: KindeIdToken,
  accessToken: KindeAccessToken,
): string | undefined => {
  const orgIdTokenProperties =
    idToken.organization_properties ||
    idToken["x-hasura-organization_properties"] ||
    {};
  const orgAccessTokenProperties =
    accessToken.organization_properties ||
    accessToken["x-hasura-organization_properties"] ||
    {};
  const idValue = orgIdTokenProperties[`kp_org_${key}`]?.v;
  const accessValue = orgAccessTokenProperties[`kp_org_${key}`]?.v;
  return idValue || accessValue;
};

export const generateOrganizationObject = (
  idToken: KindeIdToken,
  accessToken: KindeAccessToken,
): KindeOrganization => {
  const orgCode = accessToken.org_code || accessToken["x-hasura-org-code"];
  const orgName = accessToken.org_name || accessToken["x-hasura-org-name"];
  if (!orgCode) {
    throw new Error("Missing required organization fields in access token");
  }

  return {
    orgCode,
    orgName,
    properties: {
      org_city: getOrgProperty("city", idToken, accessToken),
      org_industry: getOrgProperty("industry", idToken, accessToken),
      org_postcode: getOrgProperty("postcode", idToken, accessToken),
      org_state_region: getOrgProperty("state_region", idToken, accessToken),
      org_street_address: getOrgProperty("street_address", idToken, accessToken),
      org_street_address_2: getOrgProperty(
        "street_address_2",
        idToken,
        accessToken,
      ),
    },
  };
};
