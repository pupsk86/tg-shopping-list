# Step 1: App design

Decisions from the design brainstorm. Terms follow [GLOSSARY.md](../GLOSSARY.md).

## Releases

| | V1 (MVP) | V2 | V3 |
| --- | --- | --- | --- |
| Audience | Kosta's family | Public | Public |
| Sharing | None: only the Author can edit a Shopping List | | Shared Shopping Lists |
| Amount | Optional number above 0, up to 2 decimals | Number plus a unit chosen from a list (pcs, kg, g, l, pack) | |
| Item names | Typed in full | Autocomplete | |
| Limits | None | Max Shopping Lists per User, max Items per Shopping List (numbers to be set) | |
| Categories | | | Items grouped by Category |
| Connectivity | Offline only: data stays on the device | Offline and online, synced through a server | |
| Language | English only | | User picks a language and it is saved; auto-detected on first open |

## V1 decisions

- Anyone who opens the app gets in; there is no access check. Each User has their own private Shopping Lists; nobody sees anyone else's.
- A User can have several named Shopping Lists. No folders.
- An Item has a name, an optional Amount and a Bought checkmark. No prices, photos or categories.
- An Amount is a number above 0 with up to 2 decimals, typed with a comma or a dot.
- Shopping List and Item names are 1 to 100 characters. Two Shopping Lists may share a name.
- Ticking an Item moves it to a crossed-out Bought section at the bottom, always expanded and kept in the original list order. A tick can be undone. There is no "Clear bought" action.
- A Shopping List is reused by unticking its Bought Items on the next trip. Items no longer needed are deleted one by one.
- Items and Shopping Lists can be renamed and deleted. Deleting a Shopping List asks for confirmation. Deleting an Item is immediate, with a short Undo toast.
- New Items are added at the bottom of the To-buy section. No manual reordering.
- Duplicate Items are allowed.
- The app works offline only. Shopping Lists are stored on the device, so a User's phone and laptop do not share them.
- Two screens: **Lists** (each Shopping List with its count of Items left to buy, most recently changed first) and **List** (To-buy on top, Bought below). No settings screen.
- On the Lists screen, swiping a Shopping List's row to the left shows a pencil (rename) and a trash bin (delete). Kosta picked this over a pencil button on every row after trying both in a prototype.
- Items are added in place on the List screen: an "Add item" row at the end of To-buy opens into a row with the name and Amount fields, a blue tick at the end that adds the Item, and a red minus at the start that closes the row. Return on the name also adds. After adding, the row clears for the next Item with the keyboard still up. Leaving an empty row, or Telegram's Back button, closes it; Back leaves the List only when no row is open. Kosta picked this after trying three versions in a prototype; the tick is there because the iPhone's number keypad has no Return key.
- Amounts are shown with a decimal comma, such as 1,5, whichever separator was typed.
- Tapping an Item's checkbox toggles Bought; tapping its name opens an edit view (name, Amount, delete).
- A new User sees an empty Lists screen with a "Create your first list" button.
- The app follows the User's Telegram theme (light or dark) and uses Telegram's own buttons where it can.
- The bot only opens the mini app. Adding Items by chat message and notifications are out of scope.
- The interface is English only.

## V2 decisions

- On first open, the app uploads each User's existing V1 Shopping Lists to the server, so nothing is lost.
- Each User has a maximum number of Shopping Lists, and each Shopping List a maximum number of Items. The exact limits are still to be set.

## To prototype

Decided by trying, not on paper, when the task that builds it comes up. Any other UI may be prototyped too if it is cheap.

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
- Prices for Items, with a total for each Shopping List.
- Fill in the Amount's unit automatically from the Item name.
- Include the User's own past Item names in autocomplete.
- Filter offensive Shopping List and Item names.
- Rate limiting on the API and other anti-spam measures.
- Export a Shopping List as text (such as Markdown) and share it, for example to a Telegram chat or another messenger.
