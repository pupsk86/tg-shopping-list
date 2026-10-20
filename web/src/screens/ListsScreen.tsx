import { useMemo } from 'react';
import { useStore } from 'zustand';
import { listSummaries, type ShoppingStore } from '../store/store';
import { MainButton } from '../telegram/buttons';

interface Props {
  store: ShoppingStore;
  onCreate: () => void;
  /** TEMPORARY: opens the storage check. */
  onDebug: () => void;
}

export function ListsScreen({ store, onCreate, onDebug }: Props) {
  const data = useStore(store, (state) => state.data);
  const lists = useMemo(() => listSummaries(data), [data]);

  if (lists.length === 0) {
    return (
      <main className="screen empty">
        <p className="hint">You have no shopping lists yet.</p>
        <MainButton text="Create your first list" onClick={onCreate} />
        <button type="button" className="debug-link" onClick={onDebug}>
          Storage check
        </button>
      </main>
    );
  }

  return (
    <main className="screen">
      <h1 className="section-header">Shopping lists</h1>
      <ul className="rows">
        {lists.map((list) => (
          <li key={list.id} className="row">
            <span className="row-name">{list.name}</span>
            <span className="hint" aria-label={`${String(list.leftToBuy)} left to buy`}>
              {list.leftToBuy}
            </span>
          </li>
        ))}
      </ul>
      <MainButton text="New list" onClick={onCreate} />
      <button type="button" className="debug-link" onClick={onDebug}>
        Storage check
      </button>
    </main>
  );
}
