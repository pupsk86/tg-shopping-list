import {
  backButton,
  init,
  isTMA,
  mainButton,
  miniApp,
  retrieveLaunchParams,
  themeParams,
  viewport,
} from '@tma.js/sdk-react';

export type TelegramMode = 'telegram' | 'fake';

let mode: TelegramMode | null = null;

/** True in development outside Telegram, where Telegram's own buttons don't exist. */
export function isFakeTelegram(): boolean {
  return mode === 'fake';
}

/**
 * Connects to the Telegram client and copies its theme into CSS variables
 * (`--tg-theme-bg-color`, `--tg-theme-text-color` and so on), which follow theme changes live.
 * Returns null when the page was opened outside Telegram.
 */
export async function setUpTelegram(): Promise<TelegramMode | null> {
  // In development, ask the client for real: after a reload outside Telegram the plain check
  // still passes, because the fake launch parameters stay in session storage.
  if (import.meta.env.DEV && !(await isTMA('complete'))) {
    const { mockTelegram } = await import('./mockEnv');
    mockTelegram();
    mode = 'fake';
  } else if (isTMA()) {
    mode = 'telegram';
  } else {
    return null;
  }

  init();
  miniApp.mount();
  themeParams.mount();
  themeParams.bindCssVars();
  miniApp.bindCssVars();
  mainButton.mount();
  backButton.mount();
  await goFullscreen();
  miniApp.ready();
  return mode;
}

/**
 * On phones the app fills the whole screen, under Telegram's own Close and menu buttons. The
 * insets that keep content clear of them and of the phone's notch are bound to CSS variables
 * (`--tg-viewport-safe-area-inset-top`, `--tg-viewport-content-safe-area-inset-top` and so on).
 * Older clients, and desktop, keep the usual sheet.
 */
async function goFullscreen(): Promise<void> {
  try {
    await viewport.mount({ timeout: 2000 });
    viewport.bindCssVars();
    const platform = retrieveLaunchParams().tgWebAppPlatform;
    if (platform !== 'ios' && platform !== 'android') return;
    if (viewport.requestFullscreen.isAvailable() && !viewport.isFullscreen()) {
      await viewport.requestFullscreen({ timeout: 2000 });
    }
  } catch (cause) {
    console.warn('Could not open the mini app fullscreen', cause);
  }
}
