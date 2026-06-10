# Change Request Price Snapshot

**Date:** 2026-06-10
**Status:** Approved

## Problem

The cost report's `getCostByWindow` query has four UNION branches. Branch 1 (unaffected selections) was updated in the meal-selection price snapshot work to read `ms.price` instead of live `mi.price`. Branches 2 (modified selections via approved CR) and 3 (late selections via approved CR) still read live `mi.price`, meaning a price change after CR approval would retroactively alter historical cost figures for those rows.

## Goal

Snapshot `MenuItem.price` onto `ChangeRequest` at approval time so branches 2 and 3 of the cost report are as immutable as branch 1.

## In Scope

- Add `price NUMERIC(10, 2)` column to `change_request`
- Capture price in the service when a CR transitions to `Approved`
- Update branches 2 and 3 of `getCostByWindow` to read `cr.price`
- Migration `000004_change_request_price_snapshot`

## Out of Scope

- Backfilling existing rows (no prod CR data exists)
- Capturing price at CR creation time
- Branches 1 and 4 of the cost report (unaffected; branch 1 already uses `ms.price`, branch 4 uses extra quantities which are not CRs)

## Architecture

### Data model

New column on `change_request`:

```sql
price NUMERIC(10, 2) NULL
```

No backfill. Null for all pre-existing rows (none in production).

### Domain entity (`change-request.entity.ts`)

- Add `price: number | null` field
- `create()` — always passes `null` (price unset until approval)
- `reconstitute()` — accepts `price: number | null` from persistence
- `changeStatus()` — new optional parameter `price?: number | null`; stored as `this.price = price ?? null`; price is only meaningful for `Approved` transitions

### Service (`change-requests.service.ts`)

Both `updateStatus` and `bulkUpdateStatus` gain the same extra step when transitioning to `Approved`:

```
if (status === Approved && changeRequest.newMenuItemId !== null) {
  const menuItem = await this._menuItemsService.findOne(changeRequest.newMenuItemId)
  price = menuItem.price
}
```

Pass `price` (or `null` for `clearSelection` CRs) into `changeRequest.changeStatus(status, performedBy, date, price)`.

`bulkUpdateStatus` already iterates inside a transaction; the MenuItem fetch slots in per-iteration.

### Mapper (`change-request-typeorm.mapper.ts`)

- `toDomain` — read `persistence.price`, pass to `reconstitute()`
- `toPersistence` — write `domain.price` to persistence
- `toPersistencePartial` — add `price` to the partial mapping

### TypeORM entity (`change-request.typeorm-entity.ts`)

Same column + transformer as `meal-selection.typeorm-entity.ts`:

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

### Cost report (`order-summary-query-typeorm.repository.ts`)

**Branch 2** (modified selections):
- `SUM(mi.price * ...)` → `SUM(cr.price * ...)`
- `AND mi.price IS NOT NULL` → `AND cr.price IS NOT NULL`

**Branch 3** (late selections):
- `SUM(mi.price * ...)` → `SUM(cr.price * ...)`
- `AND mi.price IS NOT NULL` → `AND cr.price IS NOT NULL`

The `INNER JOIN menu_item mi` is retained in both branches — it is still required to reach `menu_period` and then `supplier` for grouping.

### Migration

`000004_change_request_price_snapshot.up.sql`:
```sql
ALTER TABLE change_request ADD COLUMN price NUMERIC(10, 2);
```

`000004_change_request_price_snapshot.down.sql`:
```sql
ALTER TABLE change_request DROP COLUMN IF EXISTS price;
```

## Invariants

- `price` is null for `Pending`, `Rejected`, and `Revoked` CRs — only `Approved` CRs with a non-null `newMenuItemId` carry a price
- `clearSelection = true` CRs have `newMenuItemId = null`, so price is null; those CRs do not appear in branches 2 or 3 (both filter `cr.new_menu_item_id IS NOT NULL`)
- Because an active selection window locks MenuItem prices, the price at CR creation and at CR approval are always identical in practice — the snapshot is for future-proofing and architectural consistency

## Relationship to Prior Work

- Follows the exact same pattern as `2026-06-10-meal-selection-price-snapshot-design.md`
- Completes price snapshot coverage for all cost report branches (1 was already done; 2 and 3 addressed here; 4 is unaffected)
