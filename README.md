# tg-shopping-list

A Telegram mini app for shopping lists. Decisions and plans are in [`docs/`](docs/); domain terms are in [GLOSSARY.md](GLOSSARY.md).

## Web app

The mini app lives in [`web/`](web/). You need Node 22 or later and pnpm (`corepack enable` installs the version the project pins).

```sh
cd web
pnpm install
pnpm dev            # http://localhost:5173 with a fake Telegram environment
pnpm test           # Vitest
pnpm typecheck      # TypeScript
pnpm lint           # ESLint
pnpm format:check   # Prettier (pnpm format fixes it)
pnpm build          # production build in web/dist
```

Outside Telegram, `pnpm dev` pretends to be the Telegram client and follows your browser's light or dark setting. Add `?theme=light` or `?theme=dark` to the address to switch. The fake environment is never part of a production build; opened outside Telegram, the deployed app only asks you to open it from the bot.

Every PR runs the checks in [`ci.yml`](.github/workflows/ci.yml). Every merge to `main` is deployed to GitHub Pages by [`deploy.yml`](.github/workflows/deploy.yml), at `https://pupsk86.github.io/tg-shopping-list/`.
