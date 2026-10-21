import { useEffect, useRef } from 'react';

/** How long the Undo toast stays up. */
export const UNDO_MS = 5000;

interface Props {
  text: string;
  onUndo: () => void;
  /** Called when the time runs out. */
  onExpire: () => void;
}

/** A short message at the bottom of the screen with an Undo button; it goes away by itself. */
export function UndoToast({ text, onUndo, onExpire }: Props) {
  const expire = useRef(onExpire);
  useEffect(() => {
    expire.current = onExpire;
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      expire.current();
    }, UNDO_MS);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="toast" role="status">
      <span className="toast-text">{text}</span>
      <button type="button" onClick={onUndo}>
        Undo
      </button>
    </div>
  );
}
