import { config } from "../config";
import { sessionManager } from "../session/sessionManager";
import { NextApiRequest, NextApiResponse } from "next";
import { validateToken } from "./jwt/validation";
import { kindeClient } from "../session/kindeServerClient";

export const getIdToken = async (req: NextApiRequest, res?: NextApiResponse) => {
  const tokenKey = "id_token";
  try {
    const session = await sessionManager(req, res);
    const token = await session.getSessionItem(tokenKey);

    if (!token || typeof token !== "string") {
      if (config.isDebugMode) {
        console.warn("getIdToken: invalid token or token is missing (are you logged in?)");
      }
      return null;
    }

    const isTokenValid = await validateToken({
      token,
    });

    if (!isTokenValid) {
      if (config.isDebugMode) {
        console.error("getIdToken: invalid token");
      }
      return null;
    }

    return token;
  } catch (error) {
    if (config.isDebugMode) {
      console.error("getIdToken", error);
    }
    return null;
  }
};
