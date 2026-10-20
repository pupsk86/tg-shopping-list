# Step 4: V1 MVP milestone

The plan for the first milestone, written as a spec. Terms follow [GLOSSARY.md](../GLOSSARY.md). Product decisions are in [01-app-design.md](01-app-design.md) and technical ones in [02-architecture.md](02-architecture.md) and [docs/adr/](adr/); this file does not repeat them, it says what the milestone delivers and how we know it is done. Step 5 split it into GitHub Issues: sub-issues of [#5 V1 MVP](https://github.com/pupsk86/tg-shopping-list/issues/5).

## Problem Statement

Kosta's family keeps shopping lists in chat messages and notes apps. Items get lost in the scroll, it is hard to see what is still left to buy in the shop, and a list cannot be reused for the next trip without retyping it. Everyone already has Telegram open all day.

## Solution

A Telegram mini app, opened from the bot's menu button, where each User keeps their own named Shopping Lists on their phone. In the shop they tick Items off; Bought Items drop to a crossed-out section at the bottom; on the next trip they untick what they need again. It works without a network connection, looks like the rest of Telegram in light and dark themes, and has no setup or sign-in.

## Milestone scope

All of V1 as decided in step 1, live on GitHub Pages and opened from the bot. One milestone, cut into thin tasks so that a working app exists after the first one or two.

### Done when

- Every task in the milestone is closed, and CI (typecheck, lint, format, tests) is green on `main`.
- The app is deployed to GitHub Pages and opens from the bot's menu button.
- Kosta's family has used it for real shopping for one week without losing a Shopping List.

## User Stories

Opening the app

1. As a User, I want to open the app from the bot's menu button, so that I can reach my lists from the chat I already use.
2. As a User, I want to get straight in without signing up or logging in, so that using the app costs nothing.
3. As a new User, I want an empty Lists screen with a "Create your first list" button, so that I know what to do first.
4. As a User, I want the app to follow my Telegram light or dark theme, so that it looks like the rest of Telegram.
5. As a User, I want the app to use Telegram's own Main and Back buttons where it can, so that it feels native.
6. As a User, I want the app to work with no network connection, so that I can use it in a shop with bad reception.

Shopping Lists

7. As a User, I want to create a named Shopping List, so that I can keep separate lists such as "Groceries" and "Hardware store".
8. As a User, I want a Shopping List name to be 1 to 100 characters, so that names fit on screen and are never empty.
9. As a User, I want to have two Shopping Lists with the same name, so that I am never blocked by a name I already used.
10. As a User, I want the Lists screen to show each Shopping List with the number of Items left to buy, so that I can see at a glance what still needs doing.
11. As a User, I want the most recently changed Shopping List at the top, so that the list I'm using is easy to reach.
12. As a User, I want to rename a Shopping List, so that I can fix a typo or reuse it for something else.
13. As a User, I want to delete a Shopping List after confirming, so that I don't lose one by accident.
14. As a User, I want only me to see my Shopping Lists, so that my lists stay private.

Items

15. As a User, I want to add an Item with a name, so that I remember to buy it.
16. As a User, I want to give an Item an optional Amount, so that I know how much to buy.
17. As a User, I want to type an Amount with a comma or a dot, so that it works the way I write numbers.
18. As a User, I want an Amount to be above 0 with up to 2 decimals, so that nonsense amounts are rejected with a clear message.
19. As a User, I want an Item name to be 1 to 100 characters, so that it is never empty and fits on screen.
20. As a User, I want new Items added at the bottom of the To-buy section, so that the order I typed them in is kept.
21. As a User, I want duplicate Items to be allowed, so that adding an Item never fails because of an earlier one.
22. As a User, I want to tap an Item's name to open its edit view, so that I can change its name or Amount.
23. As a User, I want to delete an Item from its edit view straight away with a short Undo toast, so that deleting is quick and a mistake is easy to undo.

Shopping

24. As a User, I want to tap an Item's checkbox to mark it Bought, so that I can tick things off as I shop.
25. As a User, I want Bought Items to move to a crossed-out Bought section at the bottom, always expanded, so that what's left to buy stays on top.
26. As a User, I want Bought Items to keep their original order, so that the list doesn't jump around.
27. As a User, I want to untick a Bought Item, so that I can undo a mistaken tick or reuse the list on the next trip.
28. As a User, I want the count on the Lists screen to update when I tick or untick, so that it is always right.

Keeping data safe

29. As a User, I want my Shopping Lists to still be there after I close Telegram or restart my phone, so that I never retype a list.
30. As a User, I want my Shopping Lists to survive app updates, so that a new release never wipes my data.

Owner

31. As Kosta, I want every merge to `main` deployed automatically, so that my family always has the latest version.
32. As Kosta, I want a short checklist for the bot and GitHub Pages setup, so that I can do the steps only I can do without guessing.

## Implementation Decisions

The architecture is fixed by [02-architecture.md](02-architecture.md); the decisions below are the ones added for this milestone.

- **Modules**:
  - **Domain rules**: validation and parsing of names and Amounts (comma or dot), and the To-buy / Bought ordering. Pure functions, no storage or React.
  - **Storage interface** with two implementations: Telegram DeviceStorage for production, and the browser's storage for development outside Telegram (ADR 0001). Tests use an in-memory fake of the same interface.
  - **Store**: one Zustand store holding the User's Shopping Lists, exposing actions such as create, rename and delete a Shopping List; add, edit, delete and restore an Item; tick and untick. It is the only thing that calls storage.
  - **Screens**: Lists and List, plus the Item edit view, wired to Telegram's Main and Back buttons and theme.
- **Records** carry a device-made UUID, a "last changed" time and a "deleted" mark (ADR 0002). Deleting sets the mark; screens never show marked records. Undo after deleting an Item clears the mark.
- **Saved data carries a format version** from the first release. On start the app reads the version and upgrades older data in place before showing anything. An unknown newer version is left untouched rather than overwritten.
- **Sorting** of the Lists screen uses each Shopping List's "last changed" time, which also changes when one of its Items changes.
- **Telegram environment**: the app runs inside Telegram through `@tma.js/sdk-react`; in development it runs in a normal browser with a fake Telegram environment.
- **Deploy**: a GitHub Actions workflow builds the app and publishes it to GitHub Pages on every merge to `main`. A separate workflow runs typecheck, lint, format and tests on every PR.
- **UI prototypes**: how adding an Item works, what the Item edit view looks like, and how the Telegram theme looks are answered with a quick prototype inside the task that builds that screen, then built for real.

## Testing Decisions

- A good test checks behaviour a User would notice through a public interface, never internals: it survives a refactor that keeps behaviour the same.
- **Main seam: the store over in-memory storage.** Tests call store actions and read store state, then build a fresh store on the same storage to check that data survives a reload. Example: create a Shopping List, add an Item, tick it, reload, and it is still Bought and at the bottom. Catches almost all behaviour; misses rendering and Telegram wiring.
- **Domain rules: the shared test cases.** The name and Amount rules run `contract/validation-cases.json`, which the V2 Java server will also run (ADR 0003).
- **Storage adapter: a small contract test** run against the in-memory fake and the browser storage implementation, including the format version upgrade.
- **Screens** are checked by hand in Telegram on a phone, in light and dark themes. No component or end-to-end tests in this milestone.
- There is no prior art in the repo yet; the first task sets the pattern.

## Out of Scope

- Everything marked V2 or V3 in step 1: the server, sync, public access, limits, units for Amounts, autocomplete, shared Shopping Lists, Categories, other languages.
- Everything in the step 1 backlog.
- Bot features beyond opening the app: no chat commands, no notifications.
- Browser end-to-end tests and component tests.
- Analytics, error reporting services and a settings screen.

## Further Notes

- DeviceStorage holds up to 5 MB for each bot and User, far more than a family's lists need, so V1 does not limit Shopping Lists or Items.
- The week of real use is also the check on ADR 0001: if a Shopping List disappears on any phone, that is a milestone blocker.
