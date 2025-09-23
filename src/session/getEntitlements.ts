import { config } from "../config/index";
import { getAccessToken } from "../utils/getAccessToken";
import {
  MemoryStorage,
  StorageKeys,
  clearActiveStorage,
  getEntitlementsResponse,
  getEntitlements as getEntitlementsUtils,
  setActiveStorage,
} from "@kinde/js-utils";

/**
 * Retrieves the entitlements for the current user from the Account API.
 * @param {import('next').NextApiRequest} [req]
 * @param {import('next').NextApiResponse} [res]
 * @returns {Promise<getEntitlementsResponse | null>}
 */
interface GetOrganizationFactoryParams {
  req?: import("next").NextApiRequest;
  res?: import("next").NextApiResponse;
}

export const getEntitlementsFactory =
  (
    req: GetOrganizationFactoryParams["req"],
    res: GetOrganizationFactoryParams["res"],
  ) =>
  async (): Promise<getEntitlementsResponse | null> => {
    try {
      const accessToken = (await getAccessToken(req, res)) as string;

      if (!accessToken) {
        return null;
      }

      const store: MemoryStorage = new MemoryStorage();
      setActiveStorage(store);
      await store.setSessionItem(StorageKeys.accessToken, accessToken);
      const entitlements = await getEntitlementsUtils();
      clearActiveStorage();
      store.destroySession();
      return entitlements;
    } catch (error) {
      if (config.isDebugMode) {
        console.error(error);
      }
      return null;
    }
  };
