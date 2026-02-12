import { getDecodedToken, StorageKeys } from "@kinde/js-utils";
import { withServerStorage } from "./serverStorage";

export interface ServerUser {
  id: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

interface DecodedIdToken {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  [key: string]: any; // for additional claims
}

/**
 * Fetches the decoded id token and extracts a lightweight user object for RSC / SSR prefetch.
 * Returns null if unauthenticated or token decode fails.
 */
export const getServerUser = async (
  req?: any,
  res?: any,
): Promise<ServerUser | null> => {
  try {
    return await withServerStorage(req, res, async () => {
      const idTok: DecodedIdToken = await getDecodedToken(StorageKeys.idToken);
      if (!idTok) return null;
      return {
        id: idTok.sub,
        email: idTok.email,
        given_name: idTok.given_name,
        family_name: idTok.family_name,
        picture: idTok.picture,
      };
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[getServerUser] Failed to decode ID token:", err);
    }
    return null;
  }
};
