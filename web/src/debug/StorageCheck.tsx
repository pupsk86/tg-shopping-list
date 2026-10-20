/**
 * TEMPORARY: finds out why saving hangs in Telegram on iOS. It records every event Telegram
 * sends back, raw, while it saves a test key two ways. Remove once the cause is fixed.
 */
import { deviceStorage, on, postEvent, retrieveLaunchParams } from '@tma.js/sdk-react';
import { useEffect, useState } from 'react';
import { BackButton } from '../telegram/buttons';

type Listener = () => void;
const lines: string[] = [];
const listeners = new Set<Listener>();
const started = Date.now();
let hooked = false;

function log(text: string) {
  lines.push(`${String(Date.now() - started).padStart(6)}ms ${text}`);
  listeners.forEach((listener) => {
    listener();
  });
}

function show(value: unknown): string {
  try {
    // JSON.stringify gives undefined for undefined and functions, whatever its type says.
    return value === undefined ? 'undefined' : JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/** Taps every way Telegram delivers events, before and after the SDK reads them. */
function hookEvents() {
  if (hooked) return;
  hooked = true;
  const w = window as unknown as Record<string, Record<string, unknown> | undefined>;
  const webView = w.Telegram?.WebView as Record<string, unknown> | undefined;
  if (webView) {
    webView.receiveEvent = (type: unknown, data: unknown) => {
      log(`raw in (WebView): ${show(type)} ${show(data)}`);
    };
  }
  const gameProxy = w.TelegramGameProxy;
  if (gameProxy) {
    gameProxy.receiveEvent = (type: unknown, data: unknown) => {
      log(`raw in (GameProxy): ${show(type)} ${show(data)}`);
    };
  }
  window.addEventListener('message', (event) => {
    log(`raw in (message): ${show(event.data)}`);
  });
  on('*', (event) => {
    log(`SDK got: ${show(event)}`);
  });
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        reject(new Error(`no answer after ${String(ms)}ms`));
      }, ms),
    ),
  ]);
}

async function sdkCheck() {
  const value = `sdk-${String(Date.now())}`;
  log(`SDK setItem("debug-check", "${value}")`);
  const t0 = Date.now();
  try {
    await withTimeout(deviceStorage.setItem('debug-check', value), 5000);
    log(`SDK setItem resolved after ${String(Date.now() - t0)}ms`);
  } catch (error) {
    log(`SDK setItem FAILED: ${String(error)}`);
  }
  const t1 = Date.now();
  try {
    const read = await withTimeout(deviceStorage.getItem('debug-check'), 5000);
    log(`SDK getItem resolved after ${String(Date.now() - t1)}ms: ${show(read)}`);
  } catch (error) {
    log(`SDK getItem FAILED: ${String(error)}`);
  }
}

function rawCheck() {
  const params = { req_id: `raw-${String(Date.now())}`, key: 'debug-check', value: 'raw' };
  log(`raw out: web_app_device_storage_save_key ${show(params)}`);
  postEvent('web_app_device_storage_save_key', params);
}

export function StorageCheck({ onDone }: { onDone: () => void }) {
  const [, setVersion] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    hookEvents();
    const listener = () => {
      setVersion((version) => version + 1);
    };
    listeners.add(listener);
    if (lines.length === 0) {
      try {
        const params = retrieveLaunchParams();
        log(`platform ${params.tgWebAppPlatform}, version ${params.tgWebAppVersion}`);
      } catch (error) {
        log(`no launch params: ${String(error)}`);
      }
      log(`user agent: ${navigator.userAgent}`);
    }
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const text = lines.join('\n');

  return (
    <main className="screen">
      <BackButton onClick={onDone} />
      <h1 className="section-header">Storage check (temporary)</h1>
      <p className="hint">Tap the two buttons in order, wait 10 seconds, then copy the log.</p>
      <div className="debug-buttons">
        <button type="button" className="primary" onClick={() => void sdkCheck()}>
          1. Save with SDK
        </button>
        <button type="button" className="primary" onClick={rawCheck}>
          2. Save raw
        </button>
        <button
          type="button"
          className="primary"
          onClick={() => {
            void navigator.clipboard.writeText(text).then(() => {
              setCopied(true);
            });
          }}
        >
          {copied ? 'Copied' : 'Copy log'}
        </button>
      </div>
      <textarea className="debug-log" readOnly value={text} />
    </main>
  );
}
