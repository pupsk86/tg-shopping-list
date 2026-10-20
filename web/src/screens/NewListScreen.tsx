import { useState, type SyntheticEvent } from 'react';
import { MAX_NAME_LENGTH, nameErrorMessages } from '../domain/names';
import type { ShoppingStore } from '../store/store';
import { BackButton, MainButton } from '../telegram/buttons';

interface Props {
  store: ShoppingStore;
  onDone: () => void;
}

export function NewListScreen({ store, onDone }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function create() {
    if (saving) return;
    setSaving(true);
    try {
      const result = await store.getState().createList(name);
      if (result.ok) {
        onDone();
        return;
      }
      setError(nameErrorMessages[result.error]);
    } catch (cause) {
      console.error('Could not save the Shopping List', cause);
      setError("Couldn't save the list. Try again.");
    }
    setSaving(false);
  }

  function submit(event: SyntheticEvent) {
    event.preventDefault();
    void create();
  }

  return (
    <main className="screen">
      <BackButton onClick={onDone} />
      <form onSubmit={submit} noValidate>
        <label className="section-header" htmlFor="list-name">
          List name
        </label>
        <input
          id="list-name"
          className="text-input"
          value={name}
          maxLength={MAX_NAME_LENGTH * 2}
          placeholder="Groceries"
          autoFocus
          enterKeyHint="done"
          aria-invalid={error !== null}
          aria-describedby="list-name-error"
          onChange={(event) => {
            setName(event.target.value);
            setError(null);
          }}
        />
        <p id="list-name-error" className="error" role="alert">
          {error}
        </p>
      </form>
      <MainButton text="Create list" loading={saving} onClick={() => void create()} />
    </main>
  );
}
