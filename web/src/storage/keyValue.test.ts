import { describe, expect, it } from 'vitest';
import { DeviceStorageMethodError } from '@tma.js/sdk-react';
import {
  deviceKeyValue,
  fallbackWhenUnsupported,
  isDeviceStorageUnsupported,
  memoryKeyValue,
  type DeviceStorageCalls,
  type KeyValueStore,
} from './keyValue';

const never = new Promise<never>(() => undefined);

/**
 * A stand-in for Telegram's DeviceStorage. Like Telegram, it handles requests in the order they
 * were sent, and like Telegram on iOS 9.6 it never confirms a save.
 */
function fakeDevice({ keepsValues = true, answersReads = true } = {}) {
  const values = new Map<string, string>();
  const device: DeviceStorageCalls = {
    sendSave: (key, value) => {
      if (keepsValues) values.set(key, value);
    },
    getItem: (key) => (answersReads ? Promise.resolve(values.get(key) ?? null) : never),
  };
  return device;
}

describe('DeviceStorage', () => {
  it('saves and reads back a value, without waiting for a confirmation', async () => {
    const store = deviceKeyValue(fakeDevice(), 50);
    await store.set('data', 'lists');
    expect(await store.get('data')).toBe('lists');
  });

  it('fails a save that did not reach storage', async () => {
    const store = deviceKeyValue(fakeDevice({ keepsValues: false }), 50);
    await expect(store.set('data', 'lists')).rejects.toThrow('not saved');
  });

  it('fails a read that never answers, instead of waiting forever', async () => {
    const store = deviceKeyValue(fakeDevice({ answersReads: false }), 50);
    await expect(store.get('data')).rejects.toThrow('timed out');
    await expect(store.set('data', 'lists')).rejects.toThrow('timed out');
  });
});

/** Like Telegram Web: offers DeviceStorage, then answers every call with UNSUPPORTED. */
function unsupportedDevice(): KeyValueStore & { calls: number } {
  const store = {
    calls: 0,
    get: () => {
      store.calls++;
      return Promise.reject(new DeviceStorageMethodError('UNSUPPORTED'));
    },
    set: () => {
      store.calls++;
      return Promise.reject(new DeviceStorageMethodError('UNSUPPORTED'));
    },
  };
  return store;
}

describe('Falling back when DeviceStorage is unsupported', () => {
  it('recognises only the UNSUPPORTED answer', () => {
    expect(isDeviceStorageUnsupported(new DeviceStorageMethodError('UNSUPPORTED'))).toBe(true);
    expect(isDeviceStorageUnsupported(new DeviceStorageMethodError('KEY_INVALID'))).toBe(false);
    expect(isDeviceStorageUnsupported(new Error('UNSUPPORTED'))).toBe(false);
  });

  it('uses DeviceStorage while it works', async () => {
    const device = memoryKeyValue({ data: 'on device' });
    const browser = memoryKeyValue({ data: 'in browser' });
    const store = fallbackWhenUnsupported(device, browser);
    expect(await store.get('data')).toBe('on device');
    await store.set('data', 'lists');
    expect(await device.get('data')).toBe('lists');
    expect(await browser.get('data')).toBe('in browser');
  });

  it('switches to the browser for good once DeviceStorage says unsupported', async () => {
    const device = unsupportedDevice();
    const browser = memoryKeyValue({ data: 'in browser' });
    const store = fallbackWhenUnsupported(device, browser);
    expect(await store.get('data')).toBe('in browser');
    await store.set('data', 'lists');
    expect(await browser.get('data')).toBe('lists');
    expect(device.calls).toBe(1);
  });

  it('passes other DeviceStorage failures on, without switching', async () => {
    const browser = memoryKeyValue({ data: 'in browser' });
    const store = fallbackWhenUnsupported(
      deviceKeyValue(fakeDevice({ answersReads: false }), 50),
      browser,
    );
    await expect(store.get('data')).rejects.toThrow('timed out');
  });
});
