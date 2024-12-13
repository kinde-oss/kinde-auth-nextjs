import { validateToken as jwtValidator } from "@kinde/jwt-validator";
import { config } from "../config";
import { jwtDecoder } from "@kinde/jwt-decoder";

export const validateToken = async ({
  token,
}: {
  token: string;
}): Promise<boolean> => {
  if (!token || typeof token !== "string") {
    if (config.isDebugMode) {
      console.error("validateToken: invalid token or token is missing");
    }
    return false;
  }
  try {
    console.log("attempting to validate token");
    const validationResult = await jwtValidator({
      token,
      domain: config.issuerURL,
    });

    if (!validationResult.valid) {
      if (config.isDebugMode) {
        console.error("validateToken: invalid token");
      }
      return false;
    }

    const decodedToken = jwtDecoder(token);
    console.log("token is valid", decodedToken.exp);

    // console.log("decoded token", decodedToken);
    if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
      if (config.isDebugMode) {
        console.warn("validateToken: token expired", decodedToken.exp < Date.now() / 1000, Date.now() / 1000);
      }
      return false;
    }
    console.log("token has not expired", decodedToken.exp, decodedToken.exp < Date.now() / 1000, Date.now() / 1000);


    if (decodedToken.iss !== config.issuerURL) {
      if (config.isDebugMode) {
        console.error("validateToken: invalid issuer");
      }
      return false;
    }

    return true;
  } catch (error) {
    if (config.isDebugMode) {
      console.error("validateToken", error);
    }
    return false;
  }
};
