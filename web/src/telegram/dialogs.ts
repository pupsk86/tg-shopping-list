import { popup } from '@tma.js/sdk-react';
import { isFakeTelegram } from './setup';

interface ConfirmOptions {
  title: string;
  message: string;
  /** Text of the red button that goes ahead. */
  confirmText: string;
}

/** Asks with Telegram's own popup; resolves true only when the User picks the red button. */
export async function confirmDestructive({ title, message, confirmText }: ConfirmOptions) {
  if (isFakeTelegram()) return window.confirm(`${title}\n\n${message}`);
  const pressed = await popup.show({
    title,
    message,
    buttons: [{ id: 'confirm', type: 'destructive', text: confirmText }, { type: 'cancel' }],
  });
  return pressed === 'confirm';
}
