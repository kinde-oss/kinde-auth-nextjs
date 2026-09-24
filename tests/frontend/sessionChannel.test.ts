import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  KINDE_AUTH_STORAGE_KEY,
  publishSessionEvent,
  subscribeSessionEvents,
} from "../../src/frontend/sessionChannel";

const createMemoryStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
};

describe("sessionChannel", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("publishSessionEvent posts via BroadcastChannel when available", () => {
    const postMessage = vi.fn();
    const close = vi.fn();

    class MockBroadcastChannel {
      postMessage = postMessage;
      close = close;
      onmessage: ((event: MessageEvent) => void) | null = null;
      constructor(public name: string) {}
    }

    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);

    publishSessionEvent({ type: "logged_out" });

    expect(postMessage).toHaveBeenCalledWith({ type: "logged_out" });
    expect(close).toHaveBeenCalled();
  });

  it("publishSessionEvent writes localStorage fallback payload", () => {
    class FailingBroadcastChannel {
      constructor() {
        throw new Error("unsupported");
      }
    }
    vi.stubGlobal("BroadcastChannel", FailingBroadcastChannel);

    publishSessionEvent({ type: "logged_out" });

    const raw = localStorage.getItem(KINDE_AUTH_STORAGE_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toMatchObject({ type: "logged_out" });
  });

  it("subscribeSessionEvents invokes handler on BroadcastChannel message", () => {
    const instances: Array<{
      onmessage: ((event: MessageEvent) => void) | null;
    }> = [];

    class MockBroadcastChannel {
      onmessage: ((event: MessageEvent) => void) | null = null;
      postMessage = vi.fn();
      close = vi.fn();
      constructor(public name: string) {
        instances.push(this);
      }
    }

    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);

    const handler = vi.fn();
    const unsubscribe = subscribeSessionEvents(handler);

    instances[0]?.onmessage?.({
      data: { type: "logged_out" },
    } as MessageEvent);
    expect(handler).toHaveBeenCalledWith({ type: "logged_out" });

    unsubscribe();
  });

  it("subscribeSessionEvents invokes handler on storage events", () => {
    class FailingBroadcastChannel {
      constructor() {
        throw new Error("unsupported");
      }
    }
    vi.stubGlobal("BroadcastChannel", FailingBroadcastChannel);

    const handler = vi.fn();
    const unsubscribe = subscribeSessionEvents(handler);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: KINDE_AUTH_STORAGE_KEY,
        newValue: JSON.stringify({ type: "logged_out", ts: Date.now() }),
      }),
    );

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: "logged_out" }),
    );

    unsubscribe();
  });
});
