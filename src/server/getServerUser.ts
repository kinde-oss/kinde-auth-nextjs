import { getDecodedToken } from '@kinde/js-utils';

export interface ServerUser {
  id: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

/**
 * Fetches the decoded id token and extracts a lightweight user object for RSC / SSR prefetch.
 * Returns null if unauthenticated or token decode fails.
 */
export const getServerUser = async (): Promise<ServerUser | null> => {
  try {
    const idTok: any = await getDecodedToken('idToken');
    if (!idTok) return null;
    return {
      id: idTok.sub,
      email: idTok.email,
      given_name: idTok.given_name,
      family_name: idTok.family_name,
      picture: idTok.picture,
    };
  } catch {
    return null;
  }
};
