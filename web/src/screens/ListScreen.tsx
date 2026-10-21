import { useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import { formatAmount } from '../domain/amounts';
import type { ItemRecord } from '../domain/records';
import { itemSections, type ShoppingStore } from '../store/store';
import { BackButton } from '../telegram/buttons';
import { CheckIcon, PencilIcon, PlusIcon, TrashIcon } from '../ui/icons';
import { SwipeRow } from '../ui/SwipeRow';
import { UndoToast } from '../ui/UndoToast';
import { ItemFieldsRow } from './ItemFieldsRow';

interface Props {
  store: ShoppingStore;
  listId: string;
  onBack: () => void;
}

/** Which row has the name and Amount fields open: the add row, or an Item being edited. */
type Fields = { kind: 'add' } | { kind: 'edit'; itemId: string } | null;

/**
 * One Shopping List: To-buy on top, Bought below, and a row at the end of To-buy to add Items.
 * Tapping an Item's name edits it in place; swiping it left shows edit and delete.
 */
export function ListScreen({ store, listId, onBack }: Props) {
  const data = useStore(store, (state) => state.data);
  const list = data.lists.find((candidate) => candidate.id === listId && !candidate.deleted);
  const { toBuy, bought } = useMemo(() => itemSections(data, listId), [data, listId]);
  const [fields, setFields] = useState<Fields>(null);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // A tap that closes a swiped row does only that; it doesn't also edit or tick an Item.
  const closingTap = useRef(false);
  const tapStart = useRef<{ x: number; y: number } | null>(null);

  async function run(change: () => Promise<void>) {
    try {
      await change();
    } catch (cause) {
      console.error('Could not change the Item', cause);
      setError("Couldn't save the change. Try again.");
    }
  }

  function closeFields() {
    setFields(null);
    setError(null);
  }

  function openFields(next: Fields) {
    setSwipedId(null);
    setError(null);
    setFields(next);
  }

  function remove(item: ItemRecord) {
    setSwipedId(null);
    void run(async () => {
      await store.getState().deleteItem(item.id);
      setDeleted({ id: item.id, name: item.name });
    });
  }

  function itemRow(item: ItemRecord) {
    if (fields?.kind === 'edit' && fields.itemId === item.id) {
      return (
        <ItemFieldsRow
          key={item.id}
          initial={item}
          onSubmit={(name, amount) => store.getState().editItem(item.id, name, amount)}
          onSaved={closeFields}
          onClose={closeFields}
          onError={setError}
        />
      );
    }
    return (
      <ItemRow
        key={item.id}
        item={item}
        isNew={item.id === lastAdded}
        swiped={swipedId === item.id}
        onSwipe={(open) => {
          setSwipedId(open ? item.id : null);
        }}
        onTick={() => {
          if (!closingTap.current)
            void run(() => store.getState().setBought(item.id, !item.bought));
        }}
        onEdit={() => {
          if (!closingTap.current) openFields({ kind: 'edit', itemId: item.id });
        }}
        onDelete={() => {
          remove(item);
        }}
      />
    );
  }

  if (!list) return null;

  return (
    <main
      className="screen"
      onPointerDownCapture={(event) => {
        tapStart.current = { x: event.clientX, y: event.clientY };
        // A tap anywhere but the swiped row closes it.
        closingTap.current = swipedId !== null;
        if (swipedId === null) return;
        const row = (event.target as Element).closest('[data-row-id]');
        if (row?.getAttribute('data-row-id') !== swipedId) setSwipedId(null);
        else closingTap.current = false;
      }}
      onPointerUpCapture={(event) => {
        // A tap outside the open row of fields closes it before the tap's own click, so tapping
        // another Item edits that one. Closing it later, on blur, makes Safari on iOS drop the click.
        const start = tapStart.current;
        tapStart.current = null;
        if (!fields || !start) return;
        if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;
        if ((event.target as Element).closest('.item-fields')) return;
        closeFields();
      }}
    >
      {/* Back closes an open row of fields first, and only then leaves the list. */}
      <BackButton onClick={fields ? closeFields : onBack} />
      <h1 className="list-title">{list.name}</h1>
      <h2 className="section-header">To buy</h2>
      <ul className="rows item-rows">
        {toBuy.map(itemRow)}
        {fields?.kind === 'add' ? (
          <ItemFieldsRow
            onSubmit={async (name, amount) => {
              const result = await store.getState().addItem(listId, name, amount);
              if (result.ok) setLastAdded(result.id);
              return result;
            }}
            onSaved={() => undefined}
            onClose={closeFields}
            onError={setError}
          />
        ) : (
          <li>
            <button
              type="button"
              className="row add-item-button"
              onClick={() => {
                openFields({ kind: 'add' });
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
          <ul className="rows item-rows bought">{bought.map(itemRow)}</ul>
        </>
      )}
      {deleted && (
        <UndoToast
          key={deleted.id}
          text={`Deleted “${deleted.name}”`}
          onUndo={() => {
            const { id } = deleted;
            setDeleted(null);
            void run(() => store.getState().restoreItem(id));
          }}
          onExpire={() => {
            setDeleted(null);
          }}
        />
      )}
    </main>
  );
}

interface ItemRowProps {
  item: ItemRecord;
  isNew: boolean;
  swiped: boolean;
  onSwipe: (open: boolean) => void;
  /** Ticks the Item off, or unticks it if Bought. Only the checkbox does this, not the name. */
  onTick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ItemRow({ item, isNew, swiped, onSwipe, onTick, onEdit, onDelete }: ItemRowProps) {
  return (
    <SwipeRow
      id={item.id}
      open={swiped}
      onOpenChange={onSwipe}
      actions={
        <>
          <button
            type="button"
            className="swipe-action rename"
            aria-label={`Edit ${item.name}`}
            onClick={onEdit}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            className="swipe-action delete"
            aria-label={`Delete ${item.name}`}
            onClick={onDelete}
          >
            <TrashIcon />
          </button>
        </>
      }
    >
      <span className={isNew ? 'item-content new' : 'item-content'}>
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
        <button type="button" className="item-name-button" onClick={onEdit}>
          {item.name}
        </button>
        {item.amount !== null && <span className="hint amount">{formatAmount(item.amount)}</span>}
      </span>
    </SwipeRow>
  );
}
