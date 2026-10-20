import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import {
  browserKeyValue,
  deviceKeyValue,
  fallbackWhenUnsupported,
  isDeviceStorageAvailable,
} from './storage/keyValue';
import { createStorage } from './storage/storage';
import { createShoppingStore } from './store/store';
import { setUpTelegram } from './telegram/setup';
import './index.css';

const root = createRoot(document.getElementById('root') as HTMLElement);
const mode = await setUpTelegram();

if (mode === null) {
  root.render(<p className="screen">Open this app from its Telegram bot.</p>);
} else if (mode === 'telegram' && !isDeviceStorageAvailable()) {
  // Older Telegram apps have no DeviceStorage, and the browser's storage can be wiped (ADR 0001).
  root.render(<p className="screen">Update Telegram to use this app.</p>);
} else {
  const browser = browserKeyValue(localStorage);
  const keyValue =
    mode === 'telegram' ? fallbackWhenUnsupported(deviceKeyValue(), browser) : browser;
  const store = createShoppingStore({ storage: createStorage(keyValue) });
  void store.getState().load();
  root.render(
    <StrictMode>
      <App store={store} />
    </StrictMode>,
  );
}
