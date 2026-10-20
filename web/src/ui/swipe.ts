/** Width of the buttons a swiped row shows: two square buttons. */
export const ACTIONS_WIDTH = 128;

/** How far a row sits while being dragged: it resists going past fully open or closed. */
export function dragOffset(start: number, moved: number, actionsWidth = ACTIONS_WIDTH): number {
  const offset = start + moved;
  if (offset > 0) return offset / 4;
  if (offset < -actionsWidth) return -actionsWidth + (offset + actionsWidth) / 4;
  return offset;
}

/** Whether a row stays open when let go: open once dragged past half the buttons' width. */
export function staysOpen(offset: number, actionsWidth = ACTIONS_WIDTH): boolean {
  return offset < -actionsWidth / 2;
}
