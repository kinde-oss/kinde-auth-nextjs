import {base64UrlEncode} from './base64Encode';
import {sha256} from './sha256';

// Return the base64-urlencoded sha256 hash for the PKCE challenge
export async function pkceChallengeFromVerifier(v) {
  const hashed = await sha256(v);
  return base64UrlEncode(hashed);
}
