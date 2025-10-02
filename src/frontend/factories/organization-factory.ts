import {
  KindeAccessToken,
  KindeIdToken,
  KindeOrganization,
  KindeOrganizations,
} from "../../types";
import { generateOrganizationObject } from "../../utils/generateOrganizationObject";

export const getOrganizationFactory = (
  idToken: KindeIdToken | null,
  accessToken: KindeAccessToken | null,
) => {
  return <T>(): KindeOrganization<T> | null => {
    if (!idToken || !accessToken) {
      return null;
    }
    return generateOrganizationObject<T>(idToken, accessToken);
  };
};
