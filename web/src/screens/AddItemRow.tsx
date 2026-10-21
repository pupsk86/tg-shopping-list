import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { amountErrorMessages } from '../domain/amounts';
import { MAX_NAME_LENGTH, nameErrorMessages } from '../domain/names';
import type { AddItemResult } from '../store/store';
import { CheckIcon, MinusIcon } from '../ui/icons';

interface Props {
  /** Saves the Item; the row shows the error if it is rejected. */
  onAdd: (name: string, amount: string) => Promise<AddItemResult>;
  onClose: () => void;
  onError: (message: string | null) => void;
}

/** Tapping these must not take focus from the fields, so the keyboard stays up. */
function keepFocus(event: PointerEvent) {
  event.preventDefault();
}

/**
 * The open row at the end of To-buy where a User types an Item's name and Amount. The tick or
 * Return adds the Item and clears the row for the next one, keeping the keyboard up. The minus
 * closes the row; so does leaving it while it is empty.
 */
export function AddItemRow({ onAdd, onClose, onError }: Props) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const saving = useRef(false);
  const nameInput = useRef<HTMLInputElement>(null);
  const row = useRef<HTMLLIElement>(null);

  async function add() {
    if (saving.current) return;
    saving.current = true;
    try {
      const result = await onAdd(name, amount);
      if (result.ok) {
        setName('');
        setAmount('');
        onError(null);
        nameInput.current?.focus();
        row.current?.scrollIntoView({ block: 'nearest' });
      } else if (result.field === 'name') {
        onError(nameErrorMessages[result.error]);
      } else {
        onError(amountErrorMessages[result.error]);
      }
    } catch (cause) {
      console.error('Could not add the Item', cause);
      onError("Couldn't add the item. Try again.");
    }
    saving.current = false;
  }

  function nameKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (name.trim() === '' && amount.trim() === '') onClose();
    else void add();
  }

  function amountKeyDown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    void add();
  }

  return (
    <li
      ref={row}
      className="row add-item"
      onBlur={() => {
        // Wait for focus to land: moving between the two fields is not leaving the row.
        setTimeout(() => {
          if (row.current?.contains(document.activeElement)) return;
          if (name.trim() === '' && amount.trim() === '') onClose();
        }, 0);
      }}
    >
      <button
        type="button"
        className="round-button close"
        aria-label="Stop adding"
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
        aria-label="Add item"
        onPointerDown={keepFocus}
        onClick={() => void add()}
      >
        <CheckIcon />
      </button>
    </li>
  );
}
