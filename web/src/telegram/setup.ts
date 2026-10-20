import { init, isTMA, miniApp, themeParams } from '@tma.js/sdk-react';

/**
 * Connects to the Telegram client and copies its theme into CSS variables
 * (`--tg-theme-bg-color`, `--tg-theme-text-color` and so on), which follow theme changes live.
 * Returns false when the page was opened outside Telegram.
 */
export async function setUpTelegram(): Promise<boolean> {
  if (import.meta.env.DEV && !isTMA()) {
    const { mockTelegram } = await import('./mockEnv');
    mockTelegram();
  }
  if (!isTMA()) return false;

  init();
  miniApp.mount();
  themeParams.mount();
  themeParams.bindCssVars();
  miniApp.bindCssVars();
  miniApp.ready();
  return true;
}
