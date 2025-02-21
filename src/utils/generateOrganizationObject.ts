import { KindeAccessToken, KindeIdToken } from "../../types";

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
) => {
  const orgCode = accessToken.org_code || accessToken["x-hasura-org-code"];
  const orgName = accessToken.org_name || accessToken["x-hasura-org-name"];
  if (!orgCode) {
    throw new Error("Missing required organization fields in access token");
  }

  return {
    orgCode,
    orgName,
    properties: {
      city: getOrgProperty("city", idToken, accessToken),
      industry: getOrgProperty("industry", idToken, accessToken),
      postcode: getOrgProperty("postcode", idToken, accessToken),
      state_region: getOrgProperty("state_region", idToken, accessToken),
      street_address: getOrgProperty("street_address", idToken, accessToken),
      street_address_2: getOrgProperty(
        "street_address_2",
        idToken,
        accessToken,
      ),
    },
  };
};
