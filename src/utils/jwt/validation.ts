import { validateToken as jwtValidator } from "@kinde/jwt-validator";
import { config } from "../../config";
import { jwtDecoder } from "@kinde/jwt-decoder";

// currently assumes that the token is valid
// .. should we revalidate here as well? seems redundant
export const isTokenExpired = (token: string, threshold = 0) => {
  try {
    const decodedToken = jwtDecoder(token);

    if (!decodedToken?.exp) {
      return true;
    }

    return decodedToken.exp < Math.floor(Date.now() / 1000) + threshold;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

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

  if (config.isDebugMode) {
    console.log(
      `validateToken: token is valid - it will expire in ${decodedToken.exp - Date.now() / 1000} seconds`,
    );
  }

  if (decodedToken.iss !== config.issuerURL) {
    if (config.isDebugMode) {
      console.error("validateToken: invalid issuer");
    }
    return false;
  }

  return true;
};
