# Last write wins when syncing in V2

When the same Shopping List or Item was changed on two devices, V2 sync keeps the change with the later "last changed" time, for each record separately. It is simple and fits V2, where only the Author can edit a Shopping List. The known cost is that a device with a wrong clock can lose its edits. Shared Shopping Lists in V3 may need a stronger rule, decided then.
