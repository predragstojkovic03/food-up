# Price Integrity Design

**Date:** 2026-05-26
**Scope:** `MenuItem`, `MealSelection`, `MenuItemsService`, `MealSelectionsService`

## Problem

Three related gaps in price data integrity:

1. **MenuItem creation does not snapshot meal price** — if `dto.price` is absent, the menu item is created with no price (`undefined`), even if the referenced meal already has a price. A future meal price addition would silently apply to new menu items but leave existing ones without a price.

2. **MenuItem price (and day) can be changed at any time** — once a `MealSelectionWindow` exists for a menu period, employees are already seeing and acting on menu item data. Any modification after that point produces inconsistent visible state.

3. **MealSelection has no price snapshot** — the selection references `MenuItem` and derives its price through a join. Any correction to a menu item's price retroactively changes historical order data shown in the dashboard.

---

## Layer Conventions

All changes follow this rule consistently:

| Layer | "no price" representation |
|---|---|
| Domain / Application | `undefined` |
| Persistence (TypeORM) | `null` |
| Update DTOs | `null` = "clear price"; `undefined` = "field not provided" |

`null` is only valid at the persistence boundary and as a client signal in PATCH DTOs. It must never appear inside domain logic.

---

## Change 1 — MenuItem creation price default

**File:** `MenuItemsService.create()`

Resolve the menu item's price at creation time:

```typescript
const price = dto.price !== undefined ? dto.price : meal.price;
```

If both are `undefined`, the menu item is created without a price — that is intentional and valid. This ensures that a meal's current price is snapshotted into the menu item at the moment it is added to the period, so future meal price changes have no retroactive effect on existing menu items.

---

## Change 2 — MenuItem full lock once a selection window exists

**Constraint:** `MenuItemsService.update()` and `MenuItemsService.delete()` must reject all changes once any `MealSelectionWindow` references the menu item's `menuPeriodId`.

**Mechanism:** Service-level existence check — no new state on `MenuItem`.

- Inject `MealSelectionWindowsService` into `MenuItemsService`
- Before any mutation, check if a window exists for the menu item's `menuPeriodId`
- If found, throw `InvalidOperationException` with a clear message

The lock covers both `price` and `day` fields (all mutable state on `MenuItem`). The lock status is always derivable from window existence — storing it separately on the entity would create redundant state that can drift.

---

## Change 3 — MealSelection price snapshot

### Domain entity

Add `price?: number` to `MealSelection`:

- Set once at creation from `menuItem.price`, never mutated afterward (no setter, no domain event for it)
- Represents the price the employee was shown at the moment of selection

### TypeORM entity

Add `price` column:

```typescript
@Column('numeric', {
  precision: 10,
  scale: 2,
  nullable: true,
  transformer: {
    from: (v: string | null) => (v != null ? Number(v) : undefined),
    to: (v) => v,
  },
})
price: number | null;
```

With `ORM_SYNC=true` in dev, the column is created automatically. No manual migration needed in development.

### Service

In `MealSelectionsService.create()`, the `menuItem` is already loaded for validation. Pass its price to the entity factory:

```typescript
MealSelection.create({ ..., price: menuItem.price })
```

### Response DTO

Expose `price?: number` in `MealSelectionResponseDto` (with `@Expose()`).

---

## Change 4 — MenuItem domain type correction

`MenuItem._price` currently uses `number | null` in the domain entity. Align with the layer convention:

- Change domain type to `number | undefined`
- Update the `price` setter signature: `set price(value: number | undefined)`
- Fix TypeORM mapper: `null` from DB → `undefined`; `undefined` → `null` to DB
- No DB schema change required

### Update DTO mapping pattern

`UpdateMenuItemDto.price` type: `number | null | undefined`

Service mapping:

```typescript
if (dto.price !== undefined) {
  menuItem.price = dto.price ?? undefined;
}
```

- `null` from client → `undefined` in domain (clear price)
- `number` from client → that number in domain (set price)
- absent → skip entirely (no update)

---

## What does NOT change

- `Meal.price` — already `number | undefined` in domain, no changes needed
- The meal selection update flow — `menuItemId` and `quantity` are not prices; no price re-snapshot on update (the snapshot is taken at selection creation time and is immutable)
- `MealSelectionWindow` entity — no changes; it is only read for the existence check
