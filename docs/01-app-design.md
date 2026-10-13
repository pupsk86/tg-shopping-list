# Step 1: App design

Decisions from the design brainstorm. Terms follow [GLOSSARY.md](../GLOSSARY.md).

## Releases

| | V1 (MVP) | V2 | V3 |
| --- | --- | --- | --- |
| Audience | Kosta's family | Public | Public |
| Sharing | None: only the Author can edit a Shopping List | | Shared Shopping Lists |
| Amount | Free text | Chosen from a list | |
| Categories | | | Items grouped by Category |
| Language | English only | | User picks a language and it is saved; auto-detected on first open |

## V1 decisions

- A User can have several named Shopping Lists. No folders.
- An Item has a name, an Amount and a Bought checkmark. No prices, photos or categories.
- Ticking an Item moves it to a crossed-out Bought section at the bottom, where it stays until cleared. A tick can be undone.
- The bot only opens the mini app. Adding Items by chat message and notifications are out of scope.
- The interface is English only.

## Open questions

Tracked in the brainstorm thread; answers land here.
