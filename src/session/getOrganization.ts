import { jwtDecoder } from "@kinde/jwt-decoder";
import {
  KindeAccessToken,
  KindeIdToken,
  KindeOrganization,
  KindeProperties,
} from "../types";
import { config } from "../config/index";
import { generateOrganizationObject } from "../utils/generateOrganizationObject";
import { sessionManager } from "./sessionManager";
import { getAccessToken } from "../utils/getAccessToken";

/**
 * @template T Type of organization property values. Defaults to KindeProperties
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {KindeOrganization<T>}
 */
interface GetOrganizationFactoryParams {
  req?: import("next").NextApiRequest;
  res?: import("next").NextApiResponse;
}

export const getOrganizationFactory =
  <T = KindeProperties>(
    req: GetOrganizationFactoryParams["req"],
    res: GetOrganizationFactoryParams["res"],
  ) =>
  async (): Promise<KindeOrganization<T> | null> => {
    try {
      const idTokenString = await (
        await sessionManager(req, res)
      ).getSessionItem("id_token");
      if (!idTokenString) {
        throw new Error("ID token is missing");
      }
      const idToken = jwtDecoder<KindeIdToken>(idTokenString as string);

      const accessToken = (await getAccessToken(req, res)) as string;
      const decodedToken = jwtDecoder<KindeAccessToken>(accessToken);
      return generateOrganizationObject<T>(idToken, decodedToken);
    } catch (error) {
      if (config.isDebugMode) {
        console.error(error);
      }
      return null;
    }
  };
