import { getRandomValues } from "uncrypto";

export const randomString = () => {
  const buffer = new Uint8Array(28);
  getRandomValues(buffer);
  return Array.from(buffer)
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
};
