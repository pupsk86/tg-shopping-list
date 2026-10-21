import { beforeEach, describe, expect, it } from 'vitest';
import { memoryKeyValue, type KeyValueStore } from '../storage/keyValue';
import { createStorage } from '../storage/storage';
import { createShoppingStore, itemSections, listSummaries } from './store';

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

describe('renaming a Shopping List', () => {
  it('shows the new name and moves the Shopping List to the top', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    clock = 2000;
    await store.getState().createList('Hardware store');
    clock = 3000;

    const result = await store.getState().renameList('id-1', '  Weekly groceries ');

    expect(result).toEqual({ ok: true });
    expect(shownLists(store).map((list) => list.name)).toEqual([
      'Weekly groceries',
      'Hardware store',
    ]);
    expect(store.getState().data.lists[0]?.changedAt).toBe(3000);
  });

  it('rejects an empty or too long name and keeps the old one', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');

    expect(await store.getState().renameList('id-1', ' ')).toEqual({ ok: false, error: 'empty' });
    expect(await store.getState().renameList('id-1', 'a'.repeat(101))).toEqual({
      ok: false,
      error: 'tooLong',
    });
    expect(shownLists(await openApp())[0]?.name).toBe('Groceries');
  });

  it('keeps the new name after the app is opened again', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    await store.getState().renameList('id-1', 'Market');

    expect(shownLists(await openApp())[0]?.name).toBe('Market');
  });
});

describe('deleting a Shopping List', () => {
  it('hides it and keeps the others', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    clock = 2000;
    await store.getState().createList('Hardware store');

    await store.getState().deleteList('id-1');

    expect(shownLists(store).map((list) => list.name)).toEqual(['Hardware store']);
  });

  it('stays hidden after the app is opened again', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    await store.getState().deleteList('id-1');

    expect(shownLists(await openApp())).toEqual([]);
  });

  it('keeps the record with its deleted mark and the time of the delete (ADR 0002)', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    clock = 5000;
    await store.getState().deleteList('id-1');

    expect((await openApp()).getState().data.lists).toEqual([
      { id: 'id-1', name: 'Groceries', changedAt: 5000, deleted: true },
    ]);
  });

  it('marks its Items deleted too', async () => {
    const list = { id: 'list-1', name: 'Groceries', changedAt: 1000, deleted: false };
    const item = (id: string, listId: string) => ({
      id,
      listId,
      name: 'Milk',
      amount: null,
      bought: false,
      createdAt: 1000,
      changedAt: 1000,
      deleted: false,
    });
    await createStorage(backend).save({
      lists: [list, { ...list, id: 'list-2', name: 'Other' }],
      items: [item('item-1', 'list-1'), item('item-2', 'list-2')],
    });
    const store = await openApp();
    clock = 5000;

    await store.getState().deleteList('list-1');

    const items = (await openApp()).getState().data.items;
    expect(items.map((i) => [i.id, i.deleted, i.changedAt])).toEqual([
      ['item-1', true, 5000],
      ['item-2', false, 1000],
    ]);
  });

  it('cannot rename or delete a Shopping List that is already deleted', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    await store.getState().deleteList('id-1');

    await expect(store.getState().renameList('id-1', 'Back')).rejects.toThrow();
    await expect(store.getState().deleteList('id-1')).rejects.toThrow();
    expect(shownLists(await openApp())).toEqual([]);
  });
});

describe('adding Items', () => {
  function shownItems(store: Awaited<ReturnType<typeof openApp>>, listId = 'id-1') {
    return itemSections(store.getState().data, listId).toBuy.map((item) => [
      item.name,
      item.amount,
    ]);
  }

  it('adds Items to the bottom of To-buy in the order added, with or without an Amount', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    clock = 2000;

    expect(await store.getState().addItem('id-1', ' Milk ', '')).toEqual({ ok: true, id: 'id-2' });
    clock = 3000;
    await store.getState().addItem('id-1', 'Apples', '1,5');
    clock = 4000;
    await store.getState().addItem('id-1', 'Eggs', '10');

    expect(shownItems(store)).toEqual([
      ['Milk', null],
      ['Apples', 1.5],
      ['Eggs', 10],
    ]);
    expect(itemSections(store.getState().data, 'id-1').bought).toEqual([]);
  });

  it('allows duplicate Items', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    await store.getState().addItem('id-1', 'Milk', '');
    await store.getState().addItem('id-1', 'Milk', '');

    expect(shownItems(store)).toEqual([
      ['Milk', null],
      ['Milk', null],
    ]);
  });

  it('keeps each Shopping List’s Items apart', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    await store.getState().createList('Hardware store');
    await store.getState().addItem('id-1', 'Milk', '');
    await store.getState().addItem('id-2', 'Nails', '100');

    expect(shownItems(store, 'id-1')).toEqual([['Milk', null]]);
    expect(shownItems(store, 'id-2')).toEqual([['Nails', 100]]);
  });

  it('rejects a bad name or Amount, saying which, and adds nothing', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');

    expect(await store.getState().addItem('id-1', ' ', '2')).toEqual({
      ok: false,
      field: 'name',
      error: 'empty',
    });
    expect(await store.getState().addItem('id-1', 'a'.repeat(101), '')).toEqual({
      ok: false,
      field: 'name',
      error: 'tooLong',
    });
    expect(await store.getState().addItem('id-1', 'Milk', '0')).toEqual({
      ok: false,
      field: 'amount',
      error: 'notPositive',
    });
    expect(await store.getState().addItem('id-1', 'Milk', '1.234')).toEqual({
      ok: false,
      field: 'amount',
      error: 'tooManyDecimals',
    });
    expect(await store.getState().addItem('id-1', 'Milk', 'abc')).toEqual({
      ok: false,
      field: 'amount',
      error: 'notANumber',
    });
    expect(shownItems(store)).toEqual([]);
    expect(shownItems(await openApp())).toEqual([]);
  });

  it('moves the Shopping List to the top and counts the Item as left to buy', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    clock = 2000;
    await store.getState().createList('Hardware store');
    clock = 3000;

    await store.getState().addItem('id-1', 'Milk', '');
    await store.getState().addItem('id-1', 'Eggs', '10');

    expect(shownLists(store)).toEqual([
      { id: 'id-1', name: 'Groceries', leftToBuy: 2 },
      { id: 'id-2', name: 'Hardware store', leftToBuy: 0 },
    ]);
  });

  it('keeps the Items, their order and Amounts after the app is opened again', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    for (const [name, amount] of [
      ['Milk', ''],
      ['Apples', '1,5'],
      ['Eggs', '10'],
      ['Flour', '0.25'],
    ] as const) {
      clock += 1;
      await store.getState().addItem('id-1', name, amount);
    }

    expect(shownItems(await openApp())).toEqual([
      ['Milk', null],
      ['Apples', 1.5],
      ['Eggs', 10],
      ['Flour', 0.25],
    ]);
  });

  it('keeps the order of Items added in the same millisecond', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    await Promise.all(['A', 'B', 'C'].map((name) => store.getState().addItem('id-1', name, '')));

    expect(shownItems(await openApp()).map(([name]) => name)).toEqual(['A', 'B', 'C']);
  });

  it('saves the Item with a UUID, its Shopping List, times and marks', async () => {
    const store = createShoppingStore({ storage: createStorage(backend), now: () => 1234 });
    await store.getState().load();
    const created = await store.getState().createList('Groceries');
    if (!created.ok) throw new Error('not created');
    await store.getState().addItem(created.id, 'Milk', '2');

    expect(store.getState().data.items).toEqual([
      {
        id: expect.stringMatching(/^[0-9a-f-]{36}$/) as unknown,
        listId: created.id,
        name: 'Milk',
        amount: 2,
        bought: false,
        createdAt: 1234,
        changedAt: 1234,
        deleted: false,
      },
    ]);
  });

  it('cannot add to a Shopping List that is deleted', async () => {
    const store = await openApp();
    await store.getState().createList('Groceries');
    await store.getState().deleteList('id-1');

    await expect(store.getState().addItem('id-1', 'Milk', '')).rejects.toThrow();
    expect(store.getState().data.items).toEqual([]);
  });
});
