type StorageSettingsType = typeof import("@kinde/js-utils").storageSettings;

export interface CookieStorageSettings extends StorageSettingsType {
  domain?: string;
  sameSite?: "Lax" | "Strict" | "None";
  secure?: boolean;
  httpOnly?: boolean; // has no effect in browser set but preserved for parity
}
