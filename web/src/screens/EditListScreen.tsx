import { useState } from 'react';
import type { ShoppingStore } from '../store/store';
import { confirmDestructive } from '../telegram/dialogs';
import { ListNameForm } from './ListNameForm';

interface Props {
  store: ShoppingStore;
  listId: string;
  onDone: () => void;
}

/** Rename a Shopping List, or delete it after confirming. */
export function EditListScreen({ store, listId, onDone }: Props) {
  const [list] = useState(() => store.getState().data.lists.find((l) => l.id === listId));
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!list) return null;

  async function remove() {
    if (!list) return;
    const confirmed = await confirmDestructive({
      title: 'Delete list?',
      message: `"${list.name}" and everything on it will be deleted.`,
      confirmText: 'Delete',
    });
    if (!confirmed) return;
    try {
      await store.getState().deleteList(list.id);
      onDone();
    } catch (cause) {
      console.error('Could not delete the Shopping List', cause);
      setDeleteError("Couldn't delete the list. Try again.");
    }
  }

  return (
    <ListNameForm
      initialName={list.name}
      submitText="Save"
      onSubmit={(name) => store.getState().renameList(list.id, name)}
      onDone={onDone}
    >
      <button type="button" className="destructive" onClick={() => void remove()}>
        Delete list
      </button>
      <p className="error" role="alert">
        {deleteError}
      </p>
    </ListNameForm>
  );
}
