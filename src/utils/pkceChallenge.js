import { SHA256, enc } from "crypto-js";
import { randomString } from "./randomString";

export function generateVerifier() {
  return randomString();
}

export function generateChallenge(code_verifier) {
  return SHA256(code_verifier).toString(enc.Base64url);
}

export default function pkceChallenge() {
  const code_verifier = generateVerifier();
  const code_challenge = generateChallenge(code_verifier);
  return {
    code_verifier,
    code_challenge,
  };
}
