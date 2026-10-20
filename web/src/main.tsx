import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ListsScreen } from './screens/ListsScreen';
import { setUpTelegram } from './telegram/setup';
import './index.css';

const root = createRoot(document.getElementById('root') as HTMLElement);

if (await setUpTelegram()) {
  root.render(
    <StrictMode>
      <ListsScreen />
    </StrictMode>,
  );
} else {
  root.render(<p className="screen">Open this app from its Telegram bot.</p>);
}
