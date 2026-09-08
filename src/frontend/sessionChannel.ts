export const KINDE_AUTH_CHANNEL_NAME = "kinde-auth";
export const KINDE_AUTH_STORAGE_KEY = "kinde-auth:event";

export type KindeAuthSessionEvent = {
  type: "logged_out";
};

const isBrowser = () => typeof window !== "undefined";

const canUseBroadcastChannel = () => {
  try {
    return isBrowser() && typeof BroadcastChannel !== "undefined";
  } catch {
    return false;
  }
};

/**
 * Publishes a cross-tab session event so other tabs can clear stale client
 * auth state after logout (cookies are shared; MemoryStorage is not).
 */
export const publishSessionEvent = (event: KindeAuthSessionEvent): void => {
  if (!isBrowser()) return;

  if (canUseBroadcastChannel()) {
    try {
      const channel = new BroadcastChannel(KINDE_AUTH_CHANNEL_NAME);
      channel.postMessage(event);
      channel.close();
      return;
    } catch {
      // Fall through to localStorage.
    }
  }

  try {
    localStorage.setItem(
      KINDE_AUTH_STORAGE_KEY,
      JSON.stringify({ ...event, ts: Date.now() }),
    );
  } catch {
    // private mode / storage quota — ignore
  }
};

/**
 * Subscribes to cross-tab session events via BroadcastChannel, with a
 * localStorage fallback for browsers without BroadcastChannel.
 */
export const subscribeSessionEvents = (
  handler: (event: KindeAuthSessionEvent) => void,
): (() => void) => {
  if (!isBrowser()) {
    return () => undefined;
  }

  let channel: BroadcastChannel | null = null;

  const onMessage = (data: unknown) => {
    if (
      data &&
      typeof data === "object" &&
      "type" in data &&
      (data as KindeAuthSessionEvent).type === "logged_out"
    ) {
      handler(data as KindeAuthSessionEvent);
    }
  };

  if (canUseBroadcastChannel()) {
    try {
      channel = new BroadcastChannel(KINDE_AUTH_CHANNEL_NAME);
      channel.onmessage = (messageEvent) => onMessage(messageEvent.data);
      return () => {
        try {
          channel?.close();
        } catch {
          // ignore
        }
      };
    } catch {
      channel = null;
    }
  }

  const onStorage = (storageEvent: StorageEvent) => {
    if (storageEvent.key !== KINDE_AUTH_STORAGE_KEY || !storageEvent.newValue) {
      return;
    }
    try {
      onMessage(JSON.parse(storageEvent.newValue));
    } catch {
      // ignore malformed payloads
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener("storage", onStorage);
  };
};
