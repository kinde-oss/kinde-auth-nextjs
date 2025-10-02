import { KindeAccessToken, KindeIdToken, KindeOrganization, KindeOrganizations } from "../../types";
import { generateOrganizationObject } from "../../utils/generateOrganizationObject";

export const getOrganizationFactory = (idToken: KindeIdToken, accessToken: KindeAccessToken) => {
    return <T>(): KindeOrganization<T> | null => {
        return generateOrganizationObject<T>(idToken, accessToken);
    }
}