import { NextApiRequest, NextApiResponse } from "next";
import {
  KindeAccessToken,
  KindeIdToken,
  KindeProperties,
  KindeUser,
} from "../types";
import { config } from "../config/index";
import { generateUserObject } from "../utils/generateUserObject";
import { jwtDecoder } from "@kinde/jwt-decoder";
import { getAccessToken } from "../utils/getAccessToken";
import { getIdToken } from "../utils/getIdToken";

export const getUserFactory =
  (req: NextApiRequest, res: NextApiResponse) =>
  async <T = KindeProperties>(): Promise<KindeUser<T>> => {
    try {
      const rawToken = await getIdToken(req, res);
      if (!rawToken) {
        return null;
      }
      const idToken = jwtDecoder<KindeIdToken>(rawToken as string);

      const accessToken = await getAccessToken(req, res);
      if (!accessToken) {
        return null;
      }
      const decodedToken = jwtDecoder<KindeAccessToken>(accessToken as string);

      return generateUserObject(idToken, decodedToken) as KindeUser<T>;
    } catch (error) {
      if (config.isDebugMode) {
        console.debug("getUser", error);
      }
      return null;
    }
  };
