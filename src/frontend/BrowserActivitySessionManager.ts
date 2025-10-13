/**
 * Minimal SessionManager stub for activity tracking.
 *
 * This is a no-op implementation that exists only to satisfy the SessionManager
 * interface required by sessionManagerActivityProxy. The actual activity tracking
 * logic is handled by the proxy itself via updateActivityTimestamp().
 *
 * No session data is stored - this is purely a proxy target.
 */
export class BrowserActivitySessionManager {
  async getSessionItem<T = unknown>(): Promise<T | unknown | null> {
    return null;
  }

  async setSessionItem<T = unknown>(): Promise<void> {
    // No-op: proxy intercepts this call to trigger activity tracking
  }

  async removeSessionItem(): Promise<void> {
    // No-op: proxy intercepts this call to trigger activity tracking
  }

  async destroySession(): Promise<void> {
    // No-op: proxy handles actual cleanup
  }

  async setItems(): Promise<void> {
    // No-op: proxy intercepts this call to trigger activity tracking
  }

  async getItems(): Promise<Partial<Record<string, unknown>>> {
    return {};
  }

  async removeItems(): Promise<void> {
    // No-op: proxy intercepts this call to trigger activity tracking
  }

  subscribe(): () => void {
    return () => {}; // No-op unsubscribe
  }

  notifyListeners(): void {
    // No-op: no listeners to notify
  }
}
