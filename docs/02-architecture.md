# Step 2+3: Architecture and tech stack

Decisions from the architecture and tech stack discussion. Terms follow [GLOSSARY.md](../GLOSSARY.md); the product decisions they build on are in [01-app-design.md](01-app-design.md). The main goal: V1 runs with no server, and adding the server in V2 touches as little of the app as possible.

## Shape

```
V1:  Telegram ─▶ web app ─▶ DeviceStorage

V2:  Telegram ─▶ web app ─▶ DeviceStorage (local copy)
                    │
                    └─ HTTPS ─▶ server (Spring Boot) ─▶ database
```

The web app has three layers. Screens read and change Shopping Lists only through a store, and the store reads and writes only through the storage interface. V2 replaces what sits behind that interface; the screens and the store stay the same.

| Layer | V1 | V2 |
| --- | --- | --- |
| Screens | Lists and List, React components | Same |
| Store | One Zustand store | Same, also updated by background sync |
| Storage interface | DeviceStorage implementation | Local copy in DeviceStorage plus sync with the server |
| Domain rules | `web/src/domain`: names, Amounts, Bought | Same, and written again in Java on the server |

## Tech stack

| Area | V1 choice |
| --- | --- |
| Language | TypeScript 6, strict mode (typescript-eslint does not support TypeScript 7 yet) |
| UI | React, bundled by Vite |
| Telegram SDK | `@tma.js/sdk-react` (the successor of `@telegram-apps/sdk-react`) |
| Components | Telegram's own Main and Back buttons via the SDK, plus our own small components styled with Telegram's theme colours |
| State | Zustand |
| Navigation | In-memory routing between the two screens, wired to Telegram's Back button; nothing in the URL |
| Storage | Telegram DeviceStorage |
| Tests | Vitest |
| Checks | TypeScript, ESLint and Prettier in GitHub Actions on every PR |
| Package manager | pnpm |
| Hosting | GitHub Pages, deployed by GitHub Actions on every merge to `main` |
| Bot | No code: a BotFather menu button opens the mini app |

## V1 decisions

- Shopping Lists are stored in Telegram DeviceStorage. See [ADR 0001](adr/0001-device-storage-for-v1.md).
- Screens never touch storage directly; everything goes through one storage interface. See [ADR 0002](adr/0002-sync-ready-storage-interface.md).
- Every Shopping List and Item has an ID made on the device (a UUID), a "last changed" time, and a "deleted" mark. A deleted record is kept with that mark rather than erased, so V2 sync can tell "deleted" from "never existed". See [ADR 0002](adr/0002-sync-ready-storage-interface.md).
- The UI uses Telegram's own buttons and our own components rather than the `@telegram-apps/telegram-ui` kit. See [ADR 0004](adr/0004-own-components-not-telegram-ui-kit.md).
- In development the app also runs in a normal browser, with a fake Telegram environment and the browser's own storage standing in for DeviceStorage. This mode is never used in production.
- Browser end-to-end tests wait until after the MVP. Unit tests cover the domain rules and storage most of all.

## Repo layout

```
/
├── GLOSSARY.md
├── docs/                   decisions, one file per step, plus docs/adr/
├── contract/
│   ├── validation-cases.json   rules both sides must pass (V1)
│   └── openapi.yaml            server API (V2)
├── web/                    the mini app (pnpm, Vite)
│   └── src/domain/         rules for Shopping Lists, Items and Amounts
└── server/                 Spring Boot app with its own Gradle build (V2)
```

No pnpm workspace: with a Java server there are no JavaScript packages to share.

## V2 direction

Nothing here is built in V1; it is recorded so V1 does not make it harder.

- The server is written in Java with Spring Boot and must build as a GraalVM native image. See [ADR 0003](adr/0003-java-server-with-shared-contract.md).
- The server's API is described in `contract/openapi.yaml`, and the web app's API client is generated from it.
- The web app and the server check the same rules, written once in each language. Both test suites run `contract/validation-cases.json`, so a rule changed on one side fails the other until both agree.
- When the same Shopping List or Item was changed on two devices, the change with the later "last changed" time wins, for each record separately. See [ADR 0005](adr/0005-last-write-wins-sync.md).
- The web app and the server move from GitHub Pages to a VPS.
