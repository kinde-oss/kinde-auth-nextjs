import {
  clearActiveStorage,
  MemoryStorage,
  setActiveStorage,
  StorageKeys,
} from "@kinde/js-utils";
import { sessionManager } from "../session/sessionManager";

/**
 * Hydrates js-utils session storage from the Next.js session cookies.
 * Returns a cleanup handler that clears the in-memory storage after use.
 */
export const hydrateServerStorage = async (req?: any, res?: any) => {
  const storage = new MemoryStorage();
  setActiveStorage(storage);

  try {
    const manager = await sessionManager(req, res);
    const [accessToken, idToken, refreshToken] = await Promise.all([
      manager?.getSessionItem?.("access_token"),
      manager?.getSessionItem?.("id_token"),
      manager?.getSessionItem?.("refresh_token"),
    ]);

    const tasks: Promise<void>[] = [];

    if (typeof accessToken === "string" && accessToken) {
      tasks.push(storage.setSessionItem(StorageKeys.accessToken, accessToken));
    }
    if (typeof idToken === "string" && idToken) {
      tasks.push(storage.setSessionItem(StorageKeys.idToken, idToken));
    }
    if (typeof refreshToken === "string" && refreshToken) {
      tasks.push(
        storage.setSessionItem(StorageKeys.refreshToken, refreshToken),
      );
    }

    if (tasks.length) {
      await Promise.all(tasks);
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[kinde-auth-nextjs] Failed to hydrate server storage",
        err,
      );
    }
  }

  return async () => {
    try {
      clearActiveStorage();
    } finally {
      await storage.destroySession();
    }
  };
};

/** Convenience wrapper to run a function with hydrated storage */
export const withServerStorage = async <T>(
  req: any,
  res: any,
  fn: () => Promise<T>,
): Promise<T> => {
  const cleanup = await hydrateServerStorage(req, res);
  try {
    return await fn();
  } finally {
    await cleanup();
  }
};
