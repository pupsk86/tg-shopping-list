import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { ACTIONS_WIDTH, dragOffset, staysOpen } from './swipe';

interface Props {
  /** Marks the row so a tap elsewhere can tell it apart. */
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A tap on the closed row: no swipe, no scroll. */
  onTap: () => void;
  /** The buttons a left swipe shows. */
  actions: ReactNode;
  children: ReactNode;
}

interface Drag {
  pointerId: number;
  startX: number;
  startY: number;
  /** Set once the finger has moved far enough to tell a swipe from a scroll. */
  horizontal?: boolean;
}

/** How far a finger moves before we decide between a swipe and a scroll. */
const SLOP = 6;

/** A row that slides left to show its action buttons. One row is open at a time. */
export function SwipeRow({ id, open, onOpenChange, onTap, actions, children }: Props) {
  const drag = useRef<Drag | null>(null);
  const [offset, setOffset] = useState<number | null>(null);
  // The buttons are drawn only while the row is moved, so their colour can't show at its edges.
  const [revealed, setRevealed] = useState(open);
  const resting = open ? -ACTIONS_WIDTH : 0;

  function down(event: PointerEvent<HTMLDivElement>) {
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY };
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (current?.pointerId !== event.pointerId) return;
    const movedX = event.clientX - current.startX;
    const movedY = event.clientY - current.startY;
    if (current.horizontal === undefined) {
      if (Math.max(Math.abs(movedX), Math.abs(movedY)) < SLOP) return;
      current.horizontal = Math.abs(movedX) > Math.abs(movedY);
      if (current.horizontal) {
        event.currentTarget.setPointerCapture(event.pointerId);
        setRevealed(true);
      }
    }
    if (current.horizontal) setOffset(dragOffset(resting, movedX));
  }

  function up(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (current?.pointerId !== event.pointerId) return;
    drag.current = null;
    if (current.horizontal === undefined && !open && event.type === 'pointerup') {
      onTap();
    } else if (current.horizontal) {
      const next = offset !== null && staysOpen(offset);
      if (!next && offset === 0) setRevealed(false);
      onOpenChange(next);
    } else if (open) {
      onOpenChange(false);
    }
    setOffset(null);
  }

  return (
    <li className="swipe-row" data-row-id={id}>
      {(revealed || open) && (
        <div className="swipe-actions" style={{ width: ACTIONS_WIDTH }}>
          {actions}
        </div>
      )}
      <div
        className={offset === null ? 'row' : 'row dragging'}
        style={{ transform: `translateX(${String(offset ?? resting)}px)` }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onTap();
          }
        }}
        onTransitionEnd={() => {
          if (!open) setRevealed(false);
        }}
      >
        {children}
      </div>
    </li>
  );
}
