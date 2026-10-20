import { deviceStorage, postEvent } from '@tma.js/sdk-react';

/** The few calls the storage needs from whatever holds the bytes. */
export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

/** The DeviceStorage calls we use, so tests can stand in for Telegram. */
export interface DeviceStorageCalls {
  /** Asks Telegram to save a key, without waiting for an answer. */
  sendSave(key: string, value: string): void;
  getItem(key: string): PromiseLike<string | null>;
}

let saveCount = 0;

const telegramDevice: DeviceStorageCalls = {
  sendSave(key, value) {
    postEvent('web_app_device_storage_save_key', {
      req_id: `save-${String(++saveCount)}`,
      key,
      value,
    });
  },
  getItem: (key) => deviceStorage.getItem(key),
};

/**
 * Telegram DeviceStorage: what the app uses inside Telegram (ADR 0001).
 *
 * Telegram for iOS (9.6) saves a key but never sends the "saved" confirmation, so waiting for it
 * hangs. Instead a save is followed at once by a read of the same key: Telegram handles requests
 * in order, so the read answers after the save is done, and its value shows whether it worked.
 */
export function deviceKeyValue(device = telegramDevice, readTimeoutMs = 5000): KeyValueStore {
  const read = (key: string) =>
    withTimeout(
      device.getItem(key),
      readTimeoutMs,
      `Reading "${key}" from DeviceStorage timed out`,
    );

  return {
    get: read,
    async set(key, value) {
      device.sendSave(key, value);
      if ((await read(key)) !== value) throw new Error(`"${key}" was not saved to DeviceStorage`);
    },
  };
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(message));
    }, ms);
    Promise.resolve(promise).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

export function isDeviceStorageAvailable(): boolean {
  return deviceStorage.getItem.isAvailable();
}

/** The browser's own storage, standing in for DeviceStorage during development only. */
export function browserKeyValue(storage: Storage, prefix = 'tg-shopping-list:'): KeyValueStore {
  return {
    get: (key) => Promise.resolve(storage.getItem(prefix + key)),
    set: (key, value) => {
      storage.setItem(prefix + key, value);
      return Promise.resolve();
    },
  };
}

export function memoryKeyValue(initial: Record<string, string> = {}): KeyValueStore {
  const values = new Map(Object.entries(initial));
  return {
    get: (key) => Promise.resolve(values.get(key) ?? null),
    set: (key, value) => {
      values.set(key, value);
      return Promise.resolve();
    },
  };
}
