import { describe, expect, it } from 'vitest';
import { deviceKeyValue, type DeviceStorageCalls } from './keyValue';

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
