import { useMemo, useState } from 'react';
import { useStore } from 'zustand';
import { listSummaries, type ShoppingStore } from '../store/store';
import { MainButton } from '../telegram/buttons';
import { confirmDestructive } from '../telegram/dialogs';
import { PencilIcon, TrashIcon } from '../ui/icons';
import { SwipeRow } from '../ui/SwipeRow';

interface Props {
  store: ShoppingStore;
  onCreate: () => void;
  onRename: (listId: string) => void;
}

export function ListsScreen({ store, onCreate, onRename }: Props) {
  const data = useStore(store, (state) => state.data);
  const lists = useMemo(() => listSummaries(data), [data]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(listId: string, name: string) {
    const confirmed = await confirmDestructive({
      title: 'Delete list?',
      message: `"${name}" and everything on it will be deleted.`,
      confirmText: 'Delete',
    });
    if (!confirmed) {
      setOpenId(null);
      return;
    }
    try {
      await store.getState().deleteList(listId);
      setError(null);
    } catch (cause) {
      console.error('Could not delete the Shopping List', cause);
      setError("Couldn't delete the list. Try again.");
    }
    setOpenId(null);
  }

  if (lists.length === 0) {
    return (
      <main className="screen empty">
        <p className="hint">You have no shopping lists yet.</p>
        <MainButton text="Create your first list" onClick={onCreate} />
      </main>
    );
  }

  return (
    <main
      className="screen"
      onPointerDownCapture={(event) => {
        // A tap anywhere but the open row closes it.
        if (openId === null) return;
        const row = (event.target as Element).closest('[data-row-id]');
        if (row?.getAttribute('data-row-id') !== openId) setOpenId(null);
      }}
    >
      <h1 className="section-header">Shopping lists</h1>
      <ul className="rows">
        {lists.map((list) => (
          <SwipeRow
            key={list.id}
            id={list.id}
            open={openId === list.id}
            onOpenChange={(open) => {
              setOpenId(open ? list.id : null);
            }}
            actions={
              <>
                <button
                  type="button"
                  className="swipe-action rename"
                  aria-label={`Rename ${list.name}`}
                  onClick={() => {
                    onRename(list.id);
                  }}
                >
                  <PencilIcon />
                </button>
                <button
                  type="button"
                  className="swipe-action delete"
                  aria-label={`Delete ${list.name}`}
                  onClick={() => void remove(list.id, list.name)}
                >
                  <TrashIcon />
                </button>
              </>
            }
          >
            <span className="row-name">{list.name}</span>
            <span className="hint" aria-label={`${String(list.leftToBuy)} left to buy`}>
              {list.leftToBuy}
            </span>
          </SwipeRow>
        ))}
      </ul>
      <p className="error" role="alert">
        {error}
      </p>
      <MainButton text="New list" onClick={onCreate} />
    </main>
  );
}
