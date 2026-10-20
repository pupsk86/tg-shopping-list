import { emptyData, type ShoppingData } from '../domain/records';
import type { KeyValueStore } from './keyValue';

const KEY = 'data';

interface SavedFile {
  version: number;
  data: unknown;
}

export interface Format {
  version: number;
  /** Upgrades from version N to N + 1, keyed by N. */
  upgrades: Record<number, (data: unknown) => unknown>;
}

/**
 * The saved format this release writes. When the saved shape changes, bump the version and add
 * the upgrade from the previous one.
 */
export const currentFormat: Format = { version: 1, upgrades: {} };

export type LoadResult =
  | { kind: 'ok'; data: ShoppingData }
  /** Saved by a newer release of the app; this one must not read or overwrite it. */
  | { kind: 'tooNew'; version: number };

/** The only way into saved Shopping Lists (ADR 0002). V2 puts sync behind the same calls. */
export interface ShoppingStorage {
  /** Reads the data, upgrading an older format in place first. */
  load(): Promise<LoadResult>;
  /** Replaces the saved data. Throws `TooNewError` rather than overwrite a newer format. */
  save(data: ShoppingData): Promise<void>;
}

export class TooNewError extends Error {
  constructor(readonly version: number) {
    super(`Saved data has format version ${String(version)}, newer than this app knows`);
  }
}

export function createStorage(store: KeyValueStore, format = currentFormat): ShoppingStorage {
  async function read(): Promise<SavedFile | null> {
    const raw = await store.get(KEY);
    if (raw === null || raw === '') return null;
    // A parse error propagates: unreadable data must stop the app, never be overwritten.
    const file = JSON.parse(raw) as SavedFile;
    if (!Number.isInteger(file.version) || file.version < 1) {
      throw new Error(`Saved data has no valid format version: ${raw.slice(0, 100)}`);
    }
    return file;
  }

  async function write(data: ShoppingData): Promise<void> {
    const file: SavedFile = { version: format.version, data };
    await store.set(KEY, JSON.stringify(file));
  }

  return {
    async load() {
      const file = await read();
      if (file === null) return { kind: 'ok', data: emptyData };
      if (file.version > format.version) return { kind: 'tooNew', version: file.version };

      let data = file.data;
      for (let version = file.version; version < format.version; version++) {
        const upgrade = format.upgrades[version];
        if (!upgrade) throw new Error(`No upgrade from format version ${String(version)}`);
        data = upgrade(data);
      }
      if (file.version < format.version) await write(data as ShoppingData);
      return { kind: 'ok', data: data as ShoppingData };
    },

    async save(data) {
      const file = await read();
      if (file !== null && file.version > format.version) throw new TooNewError(file.version);
      await write(data);
    },
  };
}
