import { NextApiRequest, NextApiResponse } from "next";
import {
  KindeAccessToken,
  KindeIdToken,
  KindeProperties,
  KindeUser,
} from "../types";
import { config } from "../config/index";
import { generateUserObject } from "../utils/generateUserObject";
import { getAccessTokenFactory } from "./getAccessToken";
import { getIdTokenFactory } from "./getIdToken";

export const getUserFactory =
  (req: NextApiRequest, res: NextApiResponse, autoRedirect?: boolean) =>
  async <T = KindeProperties>(): Promise<KindeUser<T>> => {
    try {
      const getIdTokenFn = getIdTokenFactory(req, res, autoRedirect);
      const idToken = await getIdTokenFn();
      if (!idToken) {
        return null;
      }

      const getAccessTokenFn = getAccessTokenFactory(req, res, autoRedirect);
      const accessToken = await getAccessTokenFn();
      if (!accessToken) {
        return null;
      }

      return generateUserObject(idToken as KindeIdToken, accessToken as KindeAccessToken) as KindeUser<T>;
    } catch (error) {
      if (config.isDebugMode) {
        console.debug("getUser", error);
      }
      return null;
    }
  };
