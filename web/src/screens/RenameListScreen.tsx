import { useState } from 'react';
import type { ShoppingStore } from '../store/store';
import { ListNameForm } from './ListNameForm';

interface Props {
  store: ShoppingStore;
  listId: string;
  onDone: () => void;
}

export function RenameListScreen({ store, listId, onDone }: Props) {
  const [list] = useState(() => store.getState().data.lists.find((l) => l.id === listId));
  if (!list) return null;

  return (
    <ListNameForm
      initialName={list.name}
      submitText="Save"
      onSubmit={(name) => store.getState().renameList(list.id, name)}
      onDone={onDone}
    />
  );
}
