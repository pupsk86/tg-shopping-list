# Shopping List

A Telegram mini app where people keep shopping lists and tick off items as they buy them.

## Language

**User**:
A Telegram account that opens the mini app.
_Avoid_: Account, member, customer

**Shopping List**:
A named collection of Items that one User keeps, such as "Groceries".
_Avoid_: Cart, basket, note

**Author**:
The User who created a Shopping List. In V1, the only User who can see or change it.

**Allowlist**:
The Telegram accounts allowed to use the app in V1. Anyone else sees a "private app" message.
_Avoid_: Whitelist, members
_Avoid_: Creator, admin

**Item**:
One thing to buy on a Shopping List, identified by its name.
_Avoid_: Product, entry, line

**Amount**:
An optional number saying how much of an Item to buy; decimals allowed. From V2 it also carries a unit chosen from a fixed list, such as kg or pack.
_Avoid_: Count, qty

**Bought**:
The state of an Item someone has ticked off. Bought Items sit in a separate section at the bottom of the Shopping List.
_Avoid_: Done, checked, completed

**Category** (V3):
A grouping of Items within a Shopping List, such as "Dairy".
_Avoid_: Tag, section
