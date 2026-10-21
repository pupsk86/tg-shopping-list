import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { amountErrorMessages, formatAmount } from '../domain/amounts';
import { MAX_NAME_LENGTH, nameErrorMessages } from '../domain/names';
import type { ItemFieldsError } from '../store/store';
import { CheckIcon, MinusIcon } from '../ui/icons';

interface Props {
  /** The Item being edited; none when adding. */
  initial?: { name: string; amount: number | null };
  /** Saves the fields; the row shows the error if they are rejected. */
  onSubmit: (name: string, amount: string) => Promise<{ ok: true } | ItemFieldsError>;
  /** After a save: adding clears the row for the next Item, editing closes it. */
  onSaved: () => void;
  onClose: () => void;
  onError: (message: string | null) => void;
}

/** Tapping these must not take focus from the fields, so the keyboard stays up. */
function keepFocus(event: PointerEvent) {
  event.preventDefault();
}

/**
 * The row where a User types an Item's name and Amount, both to add an Item at the end of To-buy
 * and, in place of the Item's own row, to edit it. The tick or Return saves. The minus closes the
 * row without saving; so does leaving it with nothing changed since it opened, or empty.
 */
export function ItemFieldsRow({ initial, onSubmit, onSaved, onClose, onError }: Props) {
  const adding = initial === undefined;
  const [opened] = useState(() => ({
    name: initial?.name ?? '',
    amount: initial?.amount == null ? '' : formatAmount(initial.amount),
  }));
  const [name, setName] = useState(opened.name);
  const [amount, setAmount] = useState(opened.amount);
  const saving = useRef(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const row = useRef<HTMLLIElement>(null);

  useEffect(() => {
    // Start typing at the end of the name being edited.
    const input = nameInput.current;
    if (input) input.setSelectionRange(input.value.length, input.value.length);
  }, []);

  const empty = name.trim() === '' && amount.trim() === '';
  const unchanged = name.trim() === opened.name.trim() && amount.trim() === opened.amount.trim();

  async function save() {
    if (saving.current) return;
    saving.current = true;
    try {
      const result = await onSubmit(name, amount);
      if (result.ok) {
        onError(null);
        if (adding) {
          setName('');
          setAmount('');
          nameInput.current?.focus();
          row.current?.scrollIntoView({ block: 'nearest' });
        }
        onSaved();
      } else if (result.field === 'name') {
        onError(nameErrorMessages[result.error]);
      } else {
        onError(amountErrorMessages[result.error]);
      }
    } catch (cause) {
      console.error('Could not save the Item', cause);
      onError("Couldn't save the item. Try again.");
    }
    saving.current = false;
  }

  function nameKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (empty) onClose();
    else void save();
  }

  function amountKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    void save();
  }

  return (
    <li
      ref={row}
      className="row item-fields"
      onBlur={() => {
        // Wait for focus to land: moving between the two fields is not leaving the row.
        setTimeout(() => {
          if (row.current?.contains(document.activeElement)) return;
          if (unchanged || empty) onClose();
        }, 0);
      }}
    >
      <button
        type="button"
        className="round-button close"
        aria-label={adding ? 'Stop adding' : 'Stop editing'}
        onPointerDown={keepFocus}
        onClick={onClose}
      >
        <MinusIcon />
      </button>
      <input
        ref={nameInput}
        className="item-name"
        value={name}
        maxLength={MAX_NAME_LENGTH * 2}
        placeholder="Item"
        aria-label="Item name"
        autoComplete="off"
        autoFocus
        enterKeyHint="done"
        onKeyDown={nameKeyDown}
        onChange={(event) => {
          setName(event.target.value);
          onError(null);
        }}
      />
      <input
        className="item-amount"
        value={amount}
        maxLength={20}
        placeholder="Amount"
        aria-label="Amount"
        autoComplete="off"
        inputMode="decimal"
        enterKeyHint="done"
        onKeyDown={amountKeyDown}
        onChange={(event) => {
          setAmount(event.target.value);
          onError(null);
        }}
      />
      <button
        type="button"
        className="round-button add"
        aria-label={adding ? 'Add item' : 'Save item'}
        onPointerDown={keepFocus}
        onClick={() => void save()}
      >
        <CheckIcon />
      </button>
    </li>
  );
}
