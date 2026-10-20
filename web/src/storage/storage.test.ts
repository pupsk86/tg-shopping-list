// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import type { ShoppingData } from '../domain/records';
import { browserKeyValue, memoryKeyValue, type KeyValueStore } from './keyValue';
import { createStorage, TooNewError } from './storage';

const groceries: ShoppingData = {
  lists: [{ id: 'list-1', name: 'Groceries', changedAt: 1000, deleted: false }],
  items: [],
};

// The same contract for every place the bytes can live. DeviceStorage itself needs a real
// Telegram client, so it is checked by hand.
const backends: [string, () => KeyValueStore][] = [
  ['in-memory', () => memoryKeyValue()],
  [
    'browser storage',
    () => {
      localStorage.clear();
      return browserKeyValue(localStorage);
    },
  ],
];

describe.each(backends)('storage over %s', (_name, makeBackend) => {
  it('starts empty', async () => {
    const storage = createStorage(makeBackend());
    expect(await storage.load()).toEqual({ kind: 'ok', data: { lists: [], items: [] } });
  });

  it('gives back what was saved, also to a fresh storage on the same backend', async () => {
    const backend = makeBackend();
    await createStorage(backend).save(groceries);

    expect(await createStorage(backend).load()).toEqual({ kind: 'ok', data: groceries });
  });

  it('upgrades data saved in an older format, and saves the upgrade', async () => {
    const backend = makeBackend();
    await createStorage(backend, { version: 1, upgrades: {} }).save(groceries);
    const v2 = {
      version: 2,
      upgrades: {
        1: (data: unknown) => {
          const old = data as ShoppingData;
          return { ...old, lists: old.lists.map((list) => ({ ...list, name: list.name + '!' })) };
        },
      },
    };

    const upgraded = await createStorage(backend, v2).load();
    expect(upgraded).toMatchObject({ kind: 'ok', data: { lists: [{ name: 'Groceries!' }] } });
    // Saved back as version 2, so the upgrade is not applied twice.
    expect(await createStorage(backend, { version: 2, upgrades: {} }).load()).toEqual(upgraded);
  });

  it('leaves data from a newer format untouched', async () => {
    const backend = makeBackend();
    await createStorage(backend, { version: 2, upgrades: {} }).save(groceries);
    const before = await backend.get('data');
    const storage = createStorage(backend, { version: 1, upgrades: {} });

    expect(await storage.load()).toEqual({ kind: 'tooNew', version: 2 });
    await expect(storage.save({ lists: [], items: [] })).rejects.toThrow(TooNewError);
    expect(await backend.get('data')).toBe(before);
  });

  it('refuses unreadable data instead of treating it as empty', async () => {
    const backend = makeBackend();
    await backend.set('data', 'not json');

    await expect(createStorage(backend).load()).rejects.toThrow();
    expect(await backend.get('data')).toBe('not json');
  });
});
