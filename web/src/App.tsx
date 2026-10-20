import { useState } from 'react';
import { useStore } from 'zustand';
import { ListsScreen } from './screens/ListsScreen';
import { NewListScreen } from './screens/NewListScreen';
import type { ShoppingStore } from './store/store';

type Screen = 'lists' | 'newList';

export function App({ store }: { store: ShoppingStore }) {
  const status = useStore(store, (state) => state.status);
  const [screen, setScreen] = useState<Screen>('lists');

  switch (status) {
    case 'loading':
      return null;
    case 'tooNew':
      return (
        <p className="screen">
          Your lists were saved by a newer version of this app. Close it and open it again to
          update.
        </p>
      );
    case 'failed':
      return <p className="screen">Couldn't read your saved lists. Close the app and try again.</p>;
    case 'ready':
      return screen === 'lists' ? (
        <ListsScreen
          store={store}
          onCreate={() => {
            setScreen('newList');
          }}
        />
      ) : (
        <NewListScreen
          store={store}
          onDone={() => {
            setScreen('lists');
          }}
        />
      );
  }
}
