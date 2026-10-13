# Step 1: App design

Decisions from the design brainstorm. Terms follow [GLOSSARY.md](../GLOSSARY.md).

## Releases

| | V1 (MVP) | V2 | V3 |
| --- | --- | --- | --- |
| Audience | Kosta's family, via an Allowlist | Public | Public |
| Sharing | None: only the Author can edit a Shopping List | | Shared Shopping Lists |
| Amount | Optional number | Number plus a unit chosen from a list (pcs, kg, g, l, pack) | |
| Categories | | | Items grouped by Category |
| Connectivity | Online only | Offline use (to plan) | |
| Language | English only | | User picks a language and it is saved; auto-detected on first open |

## V1 decisions

- Only Users on the Allowlist get in. Each one has their own private Shopping Lists; nobody sees anyone else's.
- A User can have several named Shopping Lists. No folders.
- An Item has a name, an optional Amount (a number) and a Bought checkmark. No prices, photos or categories.
- Ticking an Item moves it to a crossed-out Bought section at the bottom. A tick can be undone. There is no "Clear bought" action.
- Items and Shopping Lists can be renamed and deleted. Deleting a Shopping List asks for confirmation.
- New Items are added at the bottom of the To-buy section. No manual reordering.
- Duplicate Items are allowed.
- The app needs a connection; no offline editing.
- The bot only opens the mini app. Adding Items by chat message and notifications are out of scope.
- The interface is English only.

## Backlog

Ideas agreed as worth doing, with no release assigned yet.

- Drag-to-reorder Items.
- Merge or reject duplicate Items.

## Open questions

Tracked in the brainstorm thread; answers land here.
