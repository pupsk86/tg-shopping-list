import { useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { formatAmount } from '../domain/amounts';
import type { ItemRecord } from '../domain/records';
import { itemSections, type ShoppingStore } from '../store/store';
import { BackButton } from '../telegram/buttons';
import { CheckIcon, PlusIcon } from '../ui/icons';
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

  async function setBought(item: ItemRecord, bought: boolean) {
    try {
      await store.getState().setBought(item.id, bought);
    } catch (cause) {
      console.error('Could not tick the Item', cause);
      setError("Couldn't save the change. Try again.");
    }
  }

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
          <ItemRow
            key={item.id}
            item={item}
            isNew={item.id === lastAdded}
            onTick={() => void setBought(item, true)}
          />
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
              <ItemRow
                key={item.id}
                item={item}
                isNew={false}
                onTick={() => void setBought(item, false)}
              />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

interface ItemRowProps {
  item: ItemRecord;
  isNew: boolean;
  /** Ticks the Item off, or unticks it if Bought. Only the checkbox does this, not the name. */
  onTick: () => void;
}

function ItemRow({ item, isNew, onTick }: ItemRowProps) {
  return (
    <li className={isNew ? 'row item new' : 'row item'}>
      <button
        type="button"
        role="checkbox"
        className="check-button"
        aria-checked={item.bought}
        aria-label={`Bought ${item.name}`}
        onClick={onTick}
      >
        <span className={item.bought ? 'check checked' : 'check'} aria-hidden="true">
          {item.bought && <CheckIcon />}
        </span>
      </button>
      <span className="row-name">{item.name}</span>
      {item.amount !== null && <span className="hint amount">{formatAmount(item.amount)}</span>}
    </li>
  );
}
