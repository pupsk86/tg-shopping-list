import { useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { formatAmount } from '../domain/amounts';
import type { ItemRecord } from '../domain/records';
import { itemSections, type ShoppingStore } from '../store/store';
import { BackButton } from '../telegram/buttons';
import { PlusIcon } from '../ui/icons';
import { AddItemRow } from './AddItemRow';

interface Props {
  store: ShoppingStore;
  listId: string;
  onBack: () => void;
}

/** One Shopping List: To-buy on top, Bought below, and a row at the end of To-buy to add Items. */
export function ListScreen({ store, listId, onBack }: Props) {
  const data = useStore(store, (state) => state.data);
  const list = data.lists.find((candidate) => candidate.id === listId && !candidate.deleted);
  const { toBuy, bought } = useMemo(() => itemSections(data, listId), [data, listId]);
  const [adding, setAdding] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function stopAdding() {
    setAdding(false);
    setError(null);
  }

  if (!list) return null;

  return (
    <main className="screen">
      {/* Back closes an open add row first, and only then leaves the list. */}
      <BackButton onClick={adding ? stopAdding : onBack} />
      <h1 className="list-title">{list.name}</h1>
      <h2 className="section-header">To buy</h2>
      <ul className="rows item-rows">
        {toBuy.map((item) => (
          <ItemRow key={item.id} item={item} isNew={item.id === lastAdded} />
        ))}
        {adding ? (
          <AddItemRow
            onAdd={async (name, amount) => {
              const result = await store.getState().addItem(listId, name, amount);
              if (result.ok) setLastAdded(result.id);
              return result;
            }}
            onClose={stopAdding}
            onError={setError}
          />
        ) : (
          <li>
            <button
              type="button"
              className="row add-item-button"
              onClick={() => {
                setAdding(true);
              }}
            >
              <span className="plus" aria-hidden="true">
                <PlusIcon />
              </span>
              Add item
            </button>
          </li>
        )}
      </ul>
      <p className="error" role="alert">
        {error}
      </p>
      {bought.length > 0 && (
        <>
          <h2 className="section-header">Bought</h2>
          <ul className="rows item-rows bought">
            {bought.map((item) => (
              <ItemRow key={item.id} item={item} isNew={false} />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

function ItemRow({ item, isNew }: { item: ItemRecord; isNew: boolean }) {
  return (
    <li className={isNew ? 'row item new' : 'row item'}>
      <span className="check" aria-hidden="true" />
      <span className="row-name">{item.name}</span>
      {item.amount !== null && <span className="hint amount">{formatAmount(item.amount)}</span>}
    </li>
  );
}
