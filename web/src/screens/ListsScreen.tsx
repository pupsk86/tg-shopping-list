export function ListsScreen() {
  return (
    <main className="screen empty">
      <p className="hint">You have no shopping lists yet.</p>
      {/* Creating a list comes with the next task. */}
      <button type="button" className="primary">
        Create your first list
      </button>
    </main>
  );
}
