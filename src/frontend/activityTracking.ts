import {
  sessionManagerActivityProxy,
  storageSettings,
  setActiveStorage,
  clearActiveStorage,
} from "@kinde/js-utils";
import { BrowserActivitySessionManager } from "./BrowserActivitySessionManager";
import { activityConfig } from "../config/index";
import { ActivityTrackingConfig, TimeoutActivityType } from "../types";

const ACTIVITY_COOKIE_NAME = "kinde_activity_ts";

let cleanupFunction: (() => void) | null = null;
let cookieWatcherAbortController: AbortController | null = null;

/**
 * Initialize activity tracking with sessionManagerActivityProxy.
 *
 * This sets up:
 * - A browser-side SessionManager wrapped with activity tracking proxy
 * - Cookie Store API watcher to detect server activity signals
 * - Timeout handlers that call the provided callback
 *
 * @param options - Activity tracking configuration options
 * @returns Cleanup function to stop activity tracking
 */
export function initializeActivityTracking(
  options: ActivityTrackingConfig = {},
): () => void {
  // Clean up any existing tracking
  if (cleanupFunction) {
    cleanupFunction();
  }

  const {
    timeoutMinutes = activityConfig.timeoutMinutes,
    prewarningMinutes = activityConfig.prewarningMinutes,
    onActivityTimeout,
  } = options;

  // Don't initialize if no timeout is configured
  if (!timeoutMinutes) {
    return () => {};
  }

  // Configure storage settings for activity tracking
  storageSettings.activityTimeoutMinutes = timeoutMinutes;

  if (prewarningMinutes !== undefined) {
    storageSettings.activityTimeoutPreWarningMinutes = prewarningMinutes;
  }

  // Set callback handler on storageSettings - only if provided
  if (onActivityTimeout) {
    storageSettings.onActivityTimeout = onActivityTimeout;
  }

  // Create proxy with minimal stub and set as active storage
  const proxiedManager = sessionManagerActivityProxy(
    new BrowserActivitySessionManager(),
  );
  setActiveStorage(proxiedManager);

  // Check if activity already expired on mount
  checkActivityOnMount(timeoutMinutes, onActivityTimeout);

  // Set up Cookie Store API watcher to detect server activity signals
  setupCookieWatcher(proxiedManager);

  // Store and return cleanup function
  return (cleanupFunction = () => {
    cookieWatcherAbortController?.abort();
    cookieWatcherAbortController = null;
    clearActiveStorage();
    cleanupFunction = null;
  });
}

/**
 * Check if activity timeout already expired on mount.
 * This handles the case where user closed tab/browser and came back later.
 *
 * @param timeoutMinutes - Configured timeout in minutes
 * @param onActivityTimeout - Callback to fire if timeout expired
 */
function checkActivityOnMount(
  timeoutMinutes: number,
  onActivityTimeout?: (
    timeoutType: TimeoutActivityType,
  ) => void | Promise<void>,
): void {
  if (typeof window === "undefined" || !onActivityTimeout) {
    return;
  }

  // Read the activity cookie
  const cookies = document.cookie.split(";");
  const activityCookie = cookies.find((c) =>
    c.trim().startsWith(`${ACTIVITY_COOKIE_NAME}=`),
  );

  if (!activityCookie) {
    return;
  }

  const lastActivityTimestamp = parseInt(activityCookie.split("=")[1], 10);
  const now = Date.now();
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const timeSinceLastActivity = now - lastActivityTimestamp;

  if (timeSinceLastActivity >= timeoutMs) {
    console.log(
      "[Kinde Activity] Session expired while tab was closed, triggering timeout",
    );
    onActivityTimeout(TimeoutActivityType.timeout);
  }
}

/**
 * Set up cookie watcher using Cookie Store API to detect server activity signals.
 * When the server sets the activity cookie, we signal activity to the proxy.
 *
 * @param proxiedManager - The proxied session manager
 */
function setupCookieWatcher(proxiedManager: any): void {
  if (typeof window === "undefined" || !("cookieStore" in window)) {
    return;
  }

  cookieWatcherAbortController = new AbortController();

  try {
    (window as any).cookieStore.addEventListener(
      "change",
      (event: any) => {
        console.log("[Kinde Activity] Cookie change detected:", event);
        if (
          event.changed?.some(
            (cookie: any) => cookie.name === ACTIVITY_COOKIE_NAME,
          )
        ) {
          console.log(
            "[Kinde Activity] Activity cookie changed, signaling activity",
          );
          proxiedManager.setSessionItem("_activity_signal", Date.now());
        }
      },
      { signal: cookieWatcherAbortController.signal },
    );
  } catch (error) {
    console.error("[Kinde Activity] Failed to set up cookie watcher:", error);
  }
}
