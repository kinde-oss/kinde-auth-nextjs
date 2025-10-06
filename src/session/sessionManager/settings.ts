import { StorageSettingsType } from "node_modules/@kinde/js-utils/dist/sessionManager/types";

export interface CookieStorageSettings extends StorageSettingsType {
  domain?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
  httpOnly?: boolean; // has no effect in browser set but preserved for parity
}
