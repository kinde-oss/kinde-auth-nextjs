import { ACTIVITY_COOKIE_NAME } from "./constants";

/**
 * Check if activity has expired based on last activity timestamp and timeout minutes.
 *
 * @param lastActivityTimestamp - The timestamp of the last activity in milliseconds
 * @param timeoutMinutes - The configured timeout in minutes
 * @returns true if the activity has expired, false otherwise
 */
export function isActivityExpired(
  lastActivityTimestamp: number,
  timeoutMinutes: number,
): boolean {
  const now = Date.now();
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const timeSinceLastActivity = now - lastActivityTimestamp;
  return timeSinceLastActivity >= timeoutMs;
}

/**
 * Parse the activity cookie from document.cookie string.
 * Handles '=' characters in the cookie value properly.
 *
 * @param cookieString - The document.cookie string
 * @returns The parsed timestamp as a number, or null if not found or invalid
 */
export function parseActivityCookie(cookieString: string): number | null {
  if (!cookieString) {
    return null;
  }

  // Split cookies by semicolon
  const cookies = cookieString.split(";");
  const activityCookie = cookies.find((c) =>
    c.trim().startsWith(`${ACTIVITY_COOKIE_NAME}=`),
  );

  if (!activityCookie) {
    return null;
  }

  // Split on first '=' only to preserve '=' characters in the value
  const firstEqualIndex = activityCookie.indexOf("=");
  if (firstEqualIndex === -1) {
    return null;
  }

  const value = activityCookie.substring(firstEqualIndex + 1).trim();
  const parsed = parseInt(value, 10);

  // Return null if parsing resulted in NaN
  return isNaN(parsed) ? null : parsed;
}

