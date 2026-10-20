export type ColorScheme = 'light' | 'dark';

// Colours copied from Telegram's own default themes, close enough to judge contrast in development.
const themes: Record<ColorScheme, Record<string, `#${string}`>> = {
  light: {
    bg_color: '#ffffff',
    secondary_bg_color: '#f1f1f1',
    text_color: '#000000',
    hint_color: '#999999',
    link_color: '#2481cc',
    button_color: '#2481cc',
    button_text_color: '#ffffff',
    header_bg_color: '#ffffff',
    accent_text_color: '#2481cc',
    section_bg_color: '#ffffff',
    section_header_text_color: '#6d6d72',
    section_separator_color: '#d9d9d9',
    subtitle_text_color: '#999999',
    destructive_text_color: '#ff3b30',
  },
  dark: {
    bg_color: '#212121',
    secondary_bg_color: '#181818',
    text_color: '#ffffff',
    hint_color: '#aaaaaa',
    link_color: '#8774e1',
    button_color: '#8774e1',
    button_text_color: '#ffffff',
    header_bg_color: '#212121',
    accent_text_color: '#8774e1',
    section_bg_color: '#212121',
    section_header_text_color: '#aaaaaa',
    section_separator_color: '#2f2f2f',
    subtitle_text_color: '#aaaaaa',
    destructive_text_color: '#ff595a',
  },
};

/** `?theme=light` or `?theme=dark` in the address wins; otherwise the browser's own setting. */
export function pickColorScheme(search: string, prefersDark: boolean): ColorScheme {
  const asked = new URLSearchParams(search).get('theme');
  if (asked === 'light' || asked === 'dark') return asked;
  return prefersDark ? 'dark' : 'light';
}

export function fakeThemeParams(scheme: ColorScheme): Record<string, `#${string}`> {
  return themes[scheme];
}
