import { useState } from 'react';
import { useStore } from 'zustand';
import { StorageCheck } from './debug/StorageCheck';
import { ListsScreen } from './screens/ListsScreen';
import { NewListScreen } from './screens/NewListScreen';
import type { ShoppingStore } from './store/store';

type Screen = 'lists' | 'newList' | 'debug';

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
    case 'ready': {
      const toLists = () => {
        setScreen('lists');
      };
      if (screen === 'newList') return <NewListScreen store={store} onDone={toLists} />;
      if (screen === 'debug') return <StorageCheck onDone={toLists} />;
      return (
        <ListsScreen
          store={store}
          onCreate={() => {
            setScreen('newList');
          }}
          onDebug={() => {
            setScreen('debug');
          }}
        />
      );
    }
  }
}
