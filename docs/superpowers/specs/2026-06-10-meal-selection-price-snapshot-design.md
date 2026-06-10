# Meal Selection Price Snapshot — Design Spec

**Date:** 2026-06-10
**Status:** Approved

## Problem

`MealSelection` has no `price` column — it only holds a FK to `MenuItem`. Dashboard cost reports read `mi.price` at query time, so any price change on a `MenuItem` retroactively alters historical cost totals. Price history is not preserved.

Additionally, `MenuItemsService.update()` has no guard against changing prices while a meal selection window is active, meaning prices can change underneath live selections.

## Goals

1. Snapshot `MenuItem.price` onto `MealSelection` at creation and update time.
2. Lock `MenuItem.price` while any active `MealSelectionWindow` references its `MenuPeriod`.
3. Update the cost report to read from the snapshot instead of live `MenuItem.price`.

## Out of Scope

Change-request rows in the cost query (branches 2 and 3 of the `UNION ALL`) and extra-quantity rows (branch 4) continue to read `mi.price` live. Snapshotting prices on `ChangeRequest` is a separate concern.

---

## Design

### 1. Price Resolution

`MealSelection.price` = `MenuItem.price` at the moment of creation or update. No fallback to `Meal.price`. If `MenuItem.price` is null, `MealSelection.price` is null.

### 2. Schema Change

Add a nullable `NUMERIC(10, 2)` column to `meal_selection`:

```sql
ALTER TABLE meal_selection ADD COLUMN price NUMERIC(10, 2);
```

Existing rows get `NULL`. The cost report treats `NULL` as `0` via `COALESCE`.

**TypeORM entity** (`meal-selection.typeorm-entity.ts`): add

```typescript
@Column('numeric', {
  precision: 10,
  scale: 2,
  nullable: true,
  transformer: {
    from: (v: string | null) => (v != null ? Number(v) : null),
    to: (v) => v,
  },
})
price: number | null;
```

**Domain entity** (`meal-selection.entity.ts`): add `price: number | null` to props; pass through `create()` and `reconstitute()`.

### 3. Service Changes

**`MealSelectionsService.create()`**

The method already calls `this._menuItemsService.findOne(dto.menuItemId)` to validate the menu item. Use the returned `menuItem.price` and pass it to `MealSelection.create()`.

When `dto.menuItemId` is absent (no meal selected), price is `null`.

**`MealSelectionsService.update()`**

Same pattern: when `dto.menuItemId` is present, look up the new `MenuItem` (already done for validation) and pass its `price` to `mealSelection.update()`.

When `dto.menuItemId` becomes `null` or is not changing, keep the existing price (the menu item hasn't changed) — or set null if clearing the selection.

### 4. MenuItem Price Locking

**New repository method** on `IMealSelectionWindowsRepository`:

```typescript
existsActiveByMenuPeriodId(menuPeriodId: string): Promise<boolean>;
```

Implementation queries `meal_selection_window` joined to its `menu_period_ids` join table, filtered to active windows (i.e. `isActive` logic: `open_at <= now <= close_at`).

**Guard in `MenuItemsService.update()`**: before applying a price change, call:

```typescript
const locked = await this._mealSelectionWindowsService.existsActiveByMenuPeriodId(menuItem.menuPeriodId);
if (locked) {
  throw new InvalidInputDataException(
    'Cannot change price while a meal selection window referencing this menu period is active.',
  );
}
```

This check applies only when `dto.price !== undefined` (i.e. a price update is being attempted). Day-only updates are unaffected.

`MealSelectionWindowsService` must expose a thin wrapper delegating to the repository method.

### 5. Cost Report Query Change

In `getCostByWindow()`, branch 1 (regular selections, no approved CR) currently reads:

```sql
SUM(mi.price * COALESCE(ms.quantity, 1)) AS "totalCost"
...
AND mi.price IS NOT NULL
```

Replace with:

```sql
SUM(COALESCE(ms.price, 0) * COALESCE(ms.quantity, 1)) AS "totalCost"
```

Remove the `AND mi.price IS NOT NULL` filter from branch 1 — selections with null price contribute 0 via `COALESCE`. The `INNER JOIN menu_item mi` in branch 1 is still needed for other columns but price no longer comes from it.

Branches 2, 3, and 4 (`UNION ALL` parts for CR overrides and extra quantities) are unchanged — they continue to read `mi.price` live.

### 6. Migration

```
apps/server/migrations/000003_meal_selection_price_snapshot.up.sql
apps/server/migrations/000003_meal_selection_price_snapshot.down.sql
```

**Up:**
```sql
ALTER TABLE meal_selection ADD COLUMN price NUMERIC(10, 2);
```

**Down:**
```sql
ALTER TABLE meal_selection DROP COLUMN IF EXISTS price;
```
