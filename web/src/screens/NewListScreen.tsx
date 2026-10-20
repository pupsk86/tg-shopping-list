import type { ShoppingStore } from '../store/store';
import { ListNameForm } from './ListNameForm';

interface Props {
  store: ShoppingStore;
  onDone: () => void;
}

export function NewListScreen({ store, onDone }: Props) {
  return (
    <ListNameForm
      submitText="Create list"
      onSubmit={(name) => store.getState().createList(name)}
      onDone={onDone}
    />
  );
}
