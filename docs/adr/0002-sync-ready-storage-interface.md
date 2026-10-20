# Sync-ready storage behind one interface

The screens and the store reach Shopping Lists only through one storage interface, and every Shopping List and Item carries a device-made UUID, a "last changed" time and a "deleted" mark, even though V1 has no server. This costs little now and lets V2 add server sync, and the first upload of V1 data, by replacing what sits behind the interface, without touching the screens or losing or duplicating anything.

## Consequences

- Deleting a Shopping List or Item sets its "deleted" mark instead of erasing it. Readers of the code should not "clean this up": V2 sync needs the marks to spread deletes to other devices. Old marks can be purged once sync exists and the server has seen them.
- IDs are never assigned by a server, so records created offline never need renumbering.
