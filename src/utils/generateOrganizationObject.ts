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
  const idValue = idToken.organization_properties?.[`kp_org_${key}`]?.v;
  const accessValue = accessToken.organization_properties?.[`kp_org_${key}`]?.v;
  return idValue || accessValue;
};

export const generateOrganizationObject = (
  idToken: KindeIdToken,
  accessToken: KindeAccessToken,
) => {
  if (!accessToken.org_code) {
    throw new Error("Missing required organization fields in access token");
  }

  return {
    orgCode: accessToken.org_code,
    orgName: accessToken.org_name,
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
