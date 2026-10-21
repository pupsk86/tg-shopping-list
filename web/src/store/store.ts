import { createStore, type StoreApi } from 'zustand/vanilla';
import { parseAmount, type AmountError } from '../domain/amounts';
import { parseName, type NameError } from '../domain/names';
import {
  emptyData,
  type ItemRecord,
  type ShoppingData,
  type ShoppingListRecord,
} from '../domain/records';
import type { ShoppingStorage } from '../storage/storage';

export type Status =
  | 'loading'
  | 'ready'
  /** Saved by a newer release; nothing is shown or saved until the app updates. */
  | 'tooNew'
  | 'failed';

export interface ShoppingState {
  status: Status;
  data: ShoppingData;
  /** Reads saved data. Call once on start, before anything else. */
  load(): Promise<void>;
  /** Saves before it changes state, so the screens never show a Shopping List that wasn't saved. */
  createList(name: string): Promise<{ ok: true; id: string } | { ok: false; error: NameError }>;
  renameList(id: string, name: string): Promise<{ ok: true } | { ok: false; error: NameError }>;
  /** Sets the "deleted" mark on the Shopping List and its Items; nothing is erased (ADR 0002). */
  deleteList(id: string): Promise<void>;
  /**
   * Adds an Item at the bottom of the To-buy section. A blank Amount means none. The Shopping List
   * counts as changed, so it moves to the top of Lists.
   */
  addItem(listId: string, name: string, amount: string): Promise<AddItemResult>;
}

export type AddItemResult =
  | { ok: true; id: string }
  | { ok: false; field: 'name'; error: NameError }
  | { ok: false; field: 'amount'; error: AmountError };

export type ShoppingStore = StoreApi<ShoppingState>;

export interface StoreOptions {
  storage: ShoppingStorage;
  now?: () => number;
  newId?: () => string;
}

/** The only thing that calls storage; screens read and change Shopping Lists through it. */
export function createShoppingStore({
  storage,
  now = Date.now,
  newId = () => crypto.randomUUID(),
}: StoreOptions): ShoppingStore {
  // Changes run one at a time, each on the data the previous one saved, so two quick changes
  // can't overwrite each other.
  let queue: Promise<void> = Promise.resolve();

  return createStore<ShoppingState>()((set, get) => {
    function commit(change: (data: ShoppingData) => ShoppingData): Promise<void> {
      const done = queue.then(async () => {
        const { status, data } = get();
        if (status !== 'ready') throw new Error(`Can't save while ${status}`);
        const next = change(data);
        await storage.save(next);
        set({ data: next });
      });
      queue = done.catch(() => undefined);
      return done;
    }

    return {
      status: 'loading',
      data: emptyData,

      async load() {
        try {
          const result = await storage.load();
          if (result.kind === 'tooNew') set({ status: 'tooNew' });
          else set({ status: 'ready', data: result.data });
        } catch (error) {
          console.error('Could not load Shopping Lists', error);
          set({ status: 'failed' });
        }
      },

      async createList(rawName) {
        const name = parseName(rawName);
        if (!name.ok) return name;
        const list: ShoppingListRecord = {
          id: newId(),
          name: name.value,
          changedAt: now(),
          deleted: false,
        };
        await commit((data) => ({ ...data, lists: [...data.lists, list] }));
        return { ok: true, id: list.id };
      },

      async renameList(id, rawName) {
        const name = parseName(rawName);
        if (!name.ok) return name;
        await commit((data) => {
          liveList(data, id);
          const changedAt = now();
          return {
            ...data,
            lists: data.lists.map((list) =>
              list.id === id ? { ...list, name: name.value, changedAt } : list,
            ),
          };
        });
        return { ok: true };
      },

      async deleteList(id) {
        await commit((data) => {
          liveList(data, id);
          const changedAt = now();
          return {
            lists: data.lists.map((list) =>
              list.id === id ? { ...list, deleted: true, changedAt } : list,
            ),
            items: data.items.map((item) =>
              item.listId === id && !item.deleted ? { ...item, deleted: true, changedAt } : item,
            ),
          };
        });
      },

      async addItem(listId, rawName, rawAmount) {
        const name = parseName(rawName);
        if (!name.ok) return { ok: false, field: 'name', error: name.error };
        const amount = parseAmount(rawAmount);
        if (!amount.ok) return { ok: false, field: 'amount', error: amount.error };
        const id = newId();
        await commit((data) => {
          liveList(data, listId);
          const changedAt = now();
          const item: ItemRecord = {
            id,
            listId,
            name: name.value,
            amount: amount.value,
            bought: false,
            createdAt: changedAt,
            changedAt,
            deleted: false,
          };
          return {
            lists: data.lists.map((list) => (list.id === listId ? { ...list, changedAt } : list)),
            items: [...data.items, item],
          };
        });
        return { ok: true, id };
      },
    };
  });
}

/** The Shopping List with this id, which must exist and not be deleted. */
function liveList(data: ShoppingData, id: string): ShoppingListRecord {
  const list = data.lists.find((candidate) => candidate.id === id && !candidate.deleted);
  if (!list) throw new Error(`No Shopping List ${id}`);
  return list;
}

export interface ListSummary {
  id: string;
  name: string;
  leftToBuy: number;
}

/** What the Lists screen shows: Shopping Lists not deleted, most recently changed first. */
export function listSummaries(data: ShoppingData): ListSummary[] {
  return data.lists
    .filter((list) => !list.deleted)
    .sort((a, b) => b.changedAt - a.changedAt)
    .map((list) => ({
      id: list.id,
      name: list.name,
      leftToBuy: data.items.filter(
        (item) => item.listId === list.id && !item.deleted && !item.bought,
      ).length,
    }));
}

export interface ItemSections {
  toBuy: ItemRecord[];
  bought: ItemRecord[];
}

/** What the List screen shows: the Shopping List's Items not deleted, each section in the order added. */
export function itemSections(data: ShoppingData, listId: string): ItemSections {
  const items = data.items
    .filter((item) => item.listId === listId && !item.deleted)
    .sort((a, b) => a.createdAt - b.createdAt);
  return {
    toBuy: items.filter((item) => !item.bought),
    bought: items.filter((item) => item.bought),
  };
}
