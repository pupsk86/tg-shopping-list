# Step 1: App design

Decisions from the design brainstorm. Terms follow [GLOSSARY.md](../GLOSSARY.md).

## Releases

| | V1 (MVP) | V2 | V3 |
| --- | --- | --- | --- |
| Audience | Kosta's family, via an Allowlist | Public | Public |
| Sharing | None: only the Author can edit a Shopping List | | Shared Shopping Lists |
| Amount | Optional number above 0, up to 2 decimals | Number plus a unit chosen from a list (pcs, kg, g, l, pack) | |
| Item names | Typed in full | Autocomplete | |
| Categories | | | Items grouped by Category |
| Connectivity | Online only | Offline use (to plan) | |
| Language | English only | | User picks a language and it is saved; auto-detected on first open |

## V1 decisions

- Only Users on the Allowlist get in. Each one has their own private Shopping Lists; nobody sees anyone else's.
- A User can have several named Shopping Lists. No folders.
- An Item has a name, an optional Amount and a Bought checkmark. No prices, photos or categories.
- An Amount is a number above 0 with up to 2 decimals, typed with a comma or a dot.
- Shopping List and Item names are 1 to 100 characters. Two Shopping Lists may share a name.
- Ticking an Item moves it to a crossed-out Bought section at the bottom, always expanded and kept in the original list order. A tick can be undone. There is no "Clear bought" action.
- A Shopping List is reused by unticking its Bought Items on the next trip. Items no longer needed are deleted one by one.
- Items and Shopping Lists can be renamed and deleted. Deleting a Shopping List asks for confirmation. Deleting an Item is immediate, with a short Undo toast.
- New Items are added at the bottom of the To-buy section. No manual reordering.
- Duplicate Items are allowed.
- The app needs a connection; no offline editing.
- Two screens: **Lists** (each Shopping List with its count of Items left to buy, most recently changed first) and **List** (To-buy on top, Bought below). No settings screen.
- Tapping an Item's checkbox toggles Bought; tapping its name opens an edit view (name, Amount, delete).
- A new User sees an empty Lists screen with a "Create your first list" button.
- The app follows the User's Telegram theme (light or dark) and uses Telegram's own buttons where it can.
- The Allowlist is a config value holding Telegram IDs. No admin screen.
- The bot only opens the mini app. Adding Items by chat message and notifications are out of scope.
- The interface is English only.

## To prototype

Decided by trying, not on paper, when the task that builds it comes up. Any other UI may be prototyped too if it is cheap.

- How adding an Item works on the List screen.
- What the Item edit view looks like.
- How the Telegram theme looks applied to both screens.

## Backlog

Ideas agreed as worth doing, with no release assigned yet.

- Drag-to-reorder Items.
- Merge or reject duplicate Items.
- Collapsible Bought section.
- Untick all Bought Items in a Shopping List in one action.
- Format the Amount field by the User's locale.
- Decide how to handle Shopping Lists with the same name.
- Templates: save a Shopping List as a template and create a Shopping List from one, with its own Templates screen.
