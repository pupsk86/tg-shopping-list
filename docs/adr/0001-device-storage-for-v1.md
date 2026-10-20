# Telegram DeviceStorage for V1 data

V1 has no server, so Shopping Lists live on the device. We store them in Telegram's DeviceStorage (persistent, up to 5 MB per bot and User) because the browser's own storage inside Telegram's web view can be wiped, notably on iOS.

## Considered Options

- **Browser storage (localStorage or IndexedDB)**: no size worries, but the web view may clear it, and a User would silently lose their Shopping Lists. Used only as the stand-in during development outside Telegram.
- **Telegram CloudStorage**: would sync a User's phone and laptop for free, but is capped at 1024 keys of 4 KB each and contradicts the step 1 decision that devices do not share Shopping Lists in V1. Real sync comes with the V2 server instead.
