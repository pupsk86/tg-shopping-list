import { describe, expect, it } from 'vitest';
import { fakeThemeParams, pickColorScheme } from './fakeTheme';

describe('pickColorScheme', () => {
  it('follows the browser setting when the address does not ask for a theme', () => {
    expect(pickColorScheme('', true)).toBe('dark');
    expect(pickColorScheme('', false)).toBe('light');
  });

  it('lets ?theme= in the address override the browser setting', () => {
    expect(pickColorScheme('?theme=light', true)).toBe('light');
    expect(pickColorScheme('?theme=dark', false)).toBe('dark');
  });

  it('ignores an unknown ?theme= value', () => {
    expect(pickColorScheme('?theme=blue', true)).toBe('dark');
  });
});

describe('fakeThemeParams', () => {
  it('gives dark text on a light background, and the reverse', () => {
    expect(fakeThemeParams('light')).toMatchObject({ bg_color: '#ffffff', text_color: '#000000' });
    expect(fakeThemeParams('dark')).toMatchObject({ bg_color: '#212121', text_color: '#ffffff' });
  });
});
