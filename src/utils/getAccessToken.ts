import { config } from "../config";
import { sessionManager } from "../session/sessionManager";
import { NextApiRequest, NextApiResponse } from "next";
import { kindeClient } from "../session/kindeServerClient";
import { validateToken } from "./validateToken";
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
        console.error("getAccessToken: invalid token or token is missing");
      }
      return null;
    }

    const isTokenValid = await validateToken({
      token,
    });

    if (!isTokenValid) {
      // look for refresh token
      console.log("attempting to refresh token");
      if (await kindeClient.refreshTokens(session)) {
        
        return await session.getSessionItem("access_token");
      }

      // if (config.isDebugMode) {
        console.error("getAccessToken: invalid token");
      // }
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
