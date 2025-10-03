export enum StorageKeys {
  accessToken = "accessToken",
  idToken = "idToken",
  refreshToken = "refreshToken",
  state = "state",
  nonce = "nonce",
  codeVerifier = "codeVerifier",
}

export enum TimeoutActivityType {
  preWarning = "preWarning",
  timeout = "timeout",
}

export type StorageSettingsType = {
  keyPrefix: string;
  maxLength: number;
  useInsecureForRefreshToken: boolean;
  activityTimeoutMinutes?: number;
  /**
   * Pre-warning in minutes. MUST be less than activityTimeoutMinutes when set.
   */
  activityTimeoutPreWarningMinutes?: number;
  onActivityTimeout?: (
    timeoutType: TimeoutActivityType,
  ) => void | Promise<void>;
};

export abstract class SessionBase<V extends string = StorageKeys>
  implements SessionManager<V>
{
  abstract getSessionItem<T = unknown>(
    itemKey: V | StorageKeys,
  ): Promise<T | unknown | null>;
  abstract setSessionItem<T = unknown>(
    itemKey: V | StorageKeys,
    itemValue: T,
  ): Promise<void>;
  abstract removeSessionItem(itemKey: V | StorageKeys): Promise<void>;
  abstract destroySession(): Promise<void>;

  async setItems(items: Partial<Record<V, unknown>>): Promise<void> {
    await Promise.all(
      (Object.entries(items) as [V | StorageKeys, unknown][]).map(
        ([key, value]) => {
          return this.setSessionItem(key, value);
        },
      ),
    );
  }

  async removeItems(...items: V[]): Promise<void> {
    await Promise.all(
      items.map((item) => {
        return this.removeSessionItem(item);
      }),
    );
  }
}

export interface SessionManager<V extends string = StorageKeys> {
  /**
   *
   * Gets the item for the provided key from the storage.
   * @param itemKey
   * @returns
   */
  getSessionItem: <T = unknown>(
    itemKey: V | StorageKeys,
  ) => Promise<T | unknown | null>;
  /**
   *
   * Sets the provided key-value store to the storage.
   * @param itemKey
   * @param itemValue
   */
  setSessionItem: <T = unknown>(
    itemKey: V | StorageKeys,
    itemValue: T,
  ) => Promise<void>;
  /**
   *
   * Removes the item for the provided key from the storage.
   * @param itemKey
   */
  removeSessionItem: (itemKey: V | StorageKeys) => Promise<void>;
  /**
   *
   * Destroys the session
   */
  destroySession: () => Promise<void>;

  /**
   * Sets multiple items simultaneously.
   * @param {Record<V | StorageKeys, unknown>} items - Object containing key-value pairs to store
   * @returns {Promise<void>}
   */
  setItems(items: Partial<Record<V, unknown>>): Promise<void>;

  /**
   * Removes multiple items simultaneously.
   * @param items
   */
  removeItems(...items: V[]): Promise<void>;
}
