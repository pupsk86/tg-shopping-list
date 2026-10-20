/**
 * Every record carries a device-made UUID, a "last changed" time and a "deleted" mark, so V2 sync
 * can merge per record and tell "deleted" from "never existed" (ADR 0002). Deleted records are
 * kept, not erased; screens skip them.
 */
interface SyncedRecord {
  id: string;
  /** Milliseconds since the epoch. */
  changedAt: number;
  deleted: boolean;
}

export interface ShoppingListRecord extends SyncedRecord {
  name: string;
}

export interface ItemRecord extends SyncedRecord {
  listId: string;
  name: string;
  /** Null when the User gave no Amount. */
  amount: number | null;
  bought: boolean;
  /** When the Item was added; both sections keep this order. */
  createdAt: number;
}

/** Everything the app keeps for one User. */
export interface ShoppingData {
  lists: ShoppingListRecord[];
  items: ItemRecord[];
}

export const emptyData: ShoppingData = { lists: [], items: [] };
