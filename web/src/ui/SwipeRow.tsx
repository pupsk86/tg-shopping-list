import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { ACTIONS_WIDTH, dragOffset, staysOpen } from './swipe';

interface Props {
  /** Marks the row so a tap elsewhere can tell it apart. */
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A tap on the closed row: no swipe, no scroll. Leave it out when the row's own buttons handle taps. */
  onTap?: () => void;
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
  const resting = open ? -ACTIONS_WIDTH : 0;
  const position = offset ?? resting;
  const moving = offset === null ? '' : ' dragging';

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
      }
    }
    if (current.horizontal) setOffset(dragOffset(resting, movedX));
  }

  function up(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (current?.pointerId !== event.pointerId) return;
    drag.current = null;
    if (current.horizontal === undefined && !open && event.type === 'pointerup') {
      onTap?.();
    } else if (current.horizontal) {
      onOpenChange(offset !== null && staysOpen(offset));
    } else if (open) {
      onOpenChange(false);
    }
    setOffset(null);
  }

  return (
    <li className="swipe-row" data-row-id={id}>
      {/* The buttons sit just past the row's right edge and slide in with it, so a closed row can't show any of them. */}
      <div
        className={`swipe-actions${moving}${offset === null && !open ? ' closed' : ''}`}
        style={{
          width: Math.max(ACTIONS_WIDTH, -position),
          transform: `translateX(${String(position)}px)`,
        }}
      >
        {actions}
      </div>
      <div
        className={`row${moving}`}
        style={{ transform: `translateX(${String(position)}px)` }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role={onTap && 'button'}
        tabIndex={onTap && 0}
        onKeyDown={
          onTap &&
          ((event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onTap();
            }
          })
        }
      >
        {children}
      </div>
    </li>
  );
}
