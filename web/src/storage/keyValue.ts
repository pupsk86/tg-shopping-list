import { deviceStorage } from '@tma.js/sdk-react';

/** The few calls the storage needs from whatever holds the bytes. */
export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

/** Telegram DeviceStorage: what the app uses inside Telegram (ADR 0001). */
export function deviceKeyValue(): KeyValueStore {
  return {
    get: (key) => deviceStorage.getItem(key),
    set: (key, value) => deviceStorage.setItem(key, value),
  };
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
