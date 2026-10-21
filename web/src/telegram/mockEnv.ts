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
      if (event.name === 'web_app_request_viewport') {
        emitEvent('viewport_changed', {
          height: window.innerHeight,
          width: window.innerWidth,
          is_expanded: true,
          is_state_stable: true,
        });
      }
      if (event.name === 'web_app_request_safe_area') {
        emitEvent('safe_area_changed', { top: 0, bottom: 0, left: 0, right: 0 });
      }
      if (event.name === 'web_app_request_content_safe_area') {
        emitEvent('content_safe_area_changed', { top: 0, bottom: 0, left: 0, right: 0 });
      }
    },
  });
  console.info(
    `Running outside Telegram with a fake ${scheme} theme. Add ?theme=light or ?theme=dark to switch.`,
  );
}
