import { config } from "../config";
import { sessionManager } from "../session/sessionManager";
import { NextApiRequest, NextApiResponse } from "next";
import { validateToken } from "./jwt/validation";
import { NextResponse } from "next/server";

export const getAccessToken = async (
  req: NextApiRequest,
  res?: NextApiResponse | NextResponse,
) => {
  try {
    const session = await sessionManager(req, res);
    const token = await session.getSessionItem("access_token");

    if (!token || typeof token !== "string") {
      if (config.isDebugMode) {
        console.warn("getAccessToken: invalid token or token is missing (are you logged in?)");
      }
      return null;
    }

    const isTokenValid = await validateToken({
      token,
    });

    if (!isTokenValid) {
      if (config.isDebugMode) {
        console.error("getAccessToken: invalid token");
      }
      return null;
    }
    return token;
  } catch (error) {
    if (config.isDebugMode) {
      console.error("getAccessToken", error);
    }
    return null;
  }
};
