import { useState, type ReactNode, type SyntheticEvent } from 'react';
import { MAX_NAME_LENGTH, nameErrorMessages, type NameError } from '../domain/names';
import { BackButton, MainButton } from '../telegram/buttons';

interface Props {
  initialName?: string;
  submitText: string;
  /** Saves the name; the form shows the error if the name is rejected. */
  onSubmit: (name: string) => Promise<{ ok: true } | { ok: false; error: NameError }>;
  onDone: () => void;
  children?: ReactNode;
}

/** The screen that asks for a Shopping List's name, for both creating and renaming. */
export function ListNameForm({ initialName = '', submitText, onSubmit, onDone, children }: Props) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (saving) return;
    setSaving(true);
    try {
      const result = await onSubmit(name);
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
    void save();
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
      {children}
      <MainButton text={submitText} loading={saving} onClick={() => void save()} />
    </main>
  );
}
