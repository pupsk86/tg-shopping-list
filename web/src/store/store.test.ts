import { beforeEach, describe, expect, it } from 'vitest';
import { memoryKeyValue, type KeyValueStore } from '../storage/keyValue';
import { createStorage } from '../storage/storage';
import { createShoppingStore, listSummaries } from './store';

let backend: KeyValueStore;
let clock: number;
let ids: number;

beforeEach(() => {
  backend = memoryKeyValue();
  clock = 1000;
  ids = 0;
});

/** A store as the app builds it on start, over the same saved data each time. */
async function openApp() {
  const store = createShoppingStore({
    storage: createStorage(backend),
    now: () => clock,
    newId: () => `id-${String(++ids)}`,
  });
  await store.getState().load();
  return store;
}

function shownLists(store: Awaited<ReturnType<typeof openApp>>) {
  return listSummaries(store.getState().data);
}

describe('creating a Shopping List', () => {
  it('shows nothing for a new User', async () => {
    const store = await openApp();
    expect(store.getState().status).toBe('ready');
    expect(shownLists(store)).toEqual([]);
  });

  it('shows the new Shopping List with nothing left to buy', async () => {
    const store = await openApp();

    const result = await store.getState().createList('Groceries');

    expect(result).toEqual({ ok: true, id: 'id-1' });
    expect(shownLists(store)).toEqual([{ id: 'id-1', name: 'Groceries', leftToBuy: 0 }]);
  });

  it('trims the name', async () => {
    const store = await openApp();
    await store.getState().createList('  Groceries ');
    expect(shownLists(store)[0]?.name).toBe('Groceries');
  });

  it('rejects an empty or too long name and creates nothing', async () => {
    const store = await openApp();

    expect(await store.getState().createList('   ')).toEqual({ ok: false, error: 'empty' });
    expect(await store.getState().createList('a'.repeat(101))).toEqual({
      ok: false,
      error: 'tooLong',
    });
    expect(shownLists(store)).toEqual([]);
    expect(shownLists(await openApp())).toEqual([]);
  });

  it('allows two Shopping Lists with the same name', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    clock = 2000;
    await store.getState().createList('Groceries');
    expect(shownLists(store).map((list) => list.name)).toEqual(['Groceries', 'Groceries']);
  });

  it('puts the most recently changed Shopping List first', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    clock = 2000;
    await store.getState().createList('Hardware store');
    clock = 3000;
    await store.getState().createList('Pharmacy');

    expect(shownLists(store).map((list) => list.name)).toEqual([
      'Pharmacy',
      'Hardware store',
      'Groceries',
    ]);
  });

  it('keeps Shopping Lists after the app is closed and opened again', async () => {
    const first = await openApp();
    await first.getState().createList('Groceries');
    clock = 2000;
    await first.getState().createList('Hardware store');

    const reopened = await openApp();

    expect(shownLists(reopened)).toEqual(shownLists(first));
    expect(shownLists(reopened).map((list) => list.name)).toEqual(['Hardware store', 'Groceries']);
  });

  it('saves the record with a UUID, last changed time and deleted mark', async () => {
    const store = createShoppingStore({ storage: createStorage(backend), now: () => 1234 });
    await store.getState().load();
    await store.getState().createList('Groceries');

    const [list] = store.getState().data.lists;
    expect(list).toEqual({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/) as unknown,
      name: 'Groceries',
      changedAt: 1234,
      deleted: false,
    });
  });

  it('keeps both of two Shopping Lists created at once', async () => {
    const store = await openApp();
    await Promise.all([store.getState().createList('A'), store.getState().createList('B')]);

    const names = shownLists(await openApp()).map((list) => list.name);
    expect(names.sort()).toEqual(['A', 'B']);
  });
});

describe('saved data the app cannot use', () => {
  it('shows nothing and saves nothing when data comes from a newer release', async () => {
    const saved = JSON.stringify({ version: 99, data: {} });
    await backend.set('data', saved);
    const store = await openApp();

    expect(store.getState().status).toBe('tooNew');
    await expect(store.getState().createList('Groceries')).rejects.toThrow();
    expect(await backend.get('data')).toBe(saved);
  });

  it('fails without overwriting data it cannot read', async () => {
    await backend.set('data', '{broken');
    const store = await openApp();

    expect(store.getState().status).toBe('failed');
    await expect(store.getState().createList('Groceries')).rejects.toThrow();
    expect(await backend.get('data')).toBe('{broken');
  });
});
