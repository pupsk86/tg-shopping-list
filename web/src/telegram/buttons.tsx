import { backButton, mainButton } from '@tma.js/sdk-react';
import { useEffect, useRef } from 'react';
import { isFakeTelegram } from './setup';

/** Keeps the latest handler without re-registering it with Telegram on every render. */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

interface MainButtonProps {
  text: string;
  onClick: () => void;
  loading?: boolean;
}

/**
 * Telegram's Main button at the bottom of the screen, shown while this is rendered.
 * Outside Telegram, in development, a look-alike is drawn in the page instead.
 */
export function MainButton({ text, onClick, loading = false }: MainButtonProps) {
  const handler = useLatest(onClick);

  useEffect(() => {
    if (isFakeTelegram()) return;
    mainButton.setParams({ text, isVisible: true, isEnabled: !loading, isLoaderVisible: loading });
    const off = mainButton.onClick(() => {
      handler.current();
    });
    return () => {
      off();
      mainButton.setParams({ isVisible: false, isLoaderVisible: false });
    };
  }, [text, loading, handler]);

  if (!isFakeTelegram()) return null;
  return (
    <div className="fake-main-button">
      <button
        type="button"
        className="primary"
        disabled={loading}
        onClick={() => {
          handler.current();
        }}
      >
        {loading ? '…' : text}
      </button>
    </div>
  );
}

/** Telegram's Back button in the header, shown while this is rendered. */
export function BackButton({ onClick }: { onClick: () => void }) {
  const handler = useLatest(onClick);

  useEffect(() => {
    if (isFakeTelegram()) return;
    backButton.show();
    const off = backButton.onClick(() => {
      handler.current();
    });
    return () => {
      off();
      backButton.hide();
    };
  }, [handler]);

  if (!isFakeTelegram()) return null;
  return (
    <button
      type="button"
      className="fake-back-button"
      onClick={() => {
        handler.current();
      }}
    >
      ‹ Back
    </button>
  );
}
