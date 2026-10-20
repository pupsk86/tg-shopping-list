import { emitEvent, mockTelegramEnv } from '@tma.js/sdk-react';
import { fakeThemeParams, pickColorScheme } from './fakeTheme';

/**
 * Pretends to be the Telegram client so the app runs in a normal browser during development.
 * Only imported behind `import.meta.env.DEV`, so it never reaches the production build.
 */
export function mockTelegram(): void {
  const scheme = pickColorScheme(
    window.location.search,
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const themeParams = fakeThemeParams(scheme);
  const user = {
    id: 1,
    first_name: 'Dev',
    last_name: 'User',
    username: 'dev',
    language_code: 'en',
  };

  mockTelegramEnv({
    launchParams: {
      tgWebAppThemeParams: themeParams,
      tgWebAppData: new URLSearchParams([
        ['user', JSON.stringify(user)],
        ['auth_date', String(Math.floor(Date.now() / 1000))],
        ['hash', 'dev'],
        ['signature', 'dev'],
      ]),
      tgWebAppVersion: '8.0',
      tgWebAppPlatform: 'tdesktop',
    },
    onEvent(event) {
      if (event.name === 'web_app_request_theme') {
        emitEvent('theme_changed', { theme_params: themeParams });
      }
    },
  });
  console.info(
    `Running outside Telegram with a fake ${scheme} theme. Add ?theme=light or ?theme=dark to switch.`,
  );
}
