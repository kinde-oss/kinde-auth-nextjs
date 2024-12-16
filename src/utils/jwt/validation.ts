import { validateToken as jwtValidator } from "@kinde/jwt-validator";
import { config } from "../../config";
import { jwtDecoder } from "@kinde/jwt-decoder";

// TODO: currently assumes that the token is valid
export const isTokenExpired = (token: string) => {
  const decodedToken = jwtDecoder(token);
  return decodedToken.exp && decodedToken.exp < Date.now() / 1000;
}

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

    if(config.isDebugMode) {
      console.log(`validateToken: token is valid - it will expire in ${decodedToken.exp - Date.now() / 1000} seconds`);
    }

    if (decodedToken.iss !== config.issuerURL) {
      if (config.isDebugMode) {
        console.error("validateToken: invalid issuer");
      }
      return false;
    }

    return true;
};
