# Own components instead of the Telegram UI kit

The UI uses Telegram's native Main and Back buttons through the SDK, plus a handful of our own components styled with Telegram's theme colours. We did not adopt `@telegram-apps/telegram-ui`, the obvious choice, because it has had no release since October 2025 and two screens need only a few components. If a prototype shows the kit would save real work, this can be revisited.
