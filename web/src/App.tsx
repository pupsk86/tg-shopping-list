import { useState } from 'react';
import { useStore } from 'zustand';
import { ListsScreen } from './screens/ListsScreen';
import { NewListScreen } from './screens/NewListScreen';
import { RenameListScreen } from './screens/RenameListScreen';
import type { ShoppingStore } from './store/store';

type Screen = { name: 'lists' } | { name: 'newList' } | { name: 'renameList'; listId: string };

export function App({ store }: { store: ShoppingStore }) {
  const status = useStore(store, (state) => state.status);
  const [screen, setScreen] = useState<Screen>({ name: 'lists' });

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
      return <ReadyApp store={store} screen={screen} setScreen={setScreen} />;
  }
}

interface ReadyProps {
  store: ShoppingStore;
  screen: Screen;
  setScreen: (screen: Screen) => void;
}

function ReadyApp({ store, screen, setScreen }: ReadyProps) {
  const toLists = () => {
    setScreen({ name: 'lists' });
  };
  switch (screen.name) {
    case 'lists':
      return (
        <ListsScreen
          store={store}
          onCreate={() => {
            setScreen({ name: 'newList' });
          }}
          onRename={(listId) => {
            setScreen({ name: 'renameList', listId });
          }}
        />
      );
    case 'newList':
      return <NewListScreen store={store} onDone={toLists} />;
    case 'renameList':
      return <RenameListScreen store={store} listId={screen.listId} onDone={toLists} />;
  }
}
