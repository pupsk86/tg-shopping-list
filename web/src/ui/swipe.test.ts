import { describe, expect, it } from 'vitest';
import { dragOffset, staysOpen } from './swipe';

describe('Swiping a row', () => {
  it('follows the finger between closed and fully open', () => {
    expect(dragOffset(0, -50, 128)).toBe(-50);
    expect(dragOffset(-128, 30, 128)).toBe(-98);
  });

  it('resists dragging past closed or fully open', () => {
    expect(dragOffset(0, 40, 128)).toBe(10);
    expect(dragOffset(0, -168, 128)).toBe(-138);
  });

  it('opens once dragged past half the buttons, and closes otherwise', () => {
    expect(staysOpen(-65, 128)).toBe(true);
    expect(staysOpen(-64, 128)).toBe(false);
    expect(staysOpen(0, 128)).toBe(false);
  });
});
