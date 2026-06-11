# Meal Price Editing — Design Spec

**Date:** 2026-06-11

## Overview

Two changes:

1. Add price to the meal inline edit row so managers can update a meal's price after creation.
2. When a meal is dragged onto the menu calendar (creating a menu item), automatically copy the meal's price to the new menu item on the backend.

Menu item price is intentionally not editable through the UI. Prices are managed at the meal level; menu items receive the price as a snapshot at creation time.

---

## 1. Meal Price Inline Editing

**File:** `apps/web/src/features/suppliers/presentation/pages/in-house-supplier-detail.page.tsx`

The `MealRow` inline edit component currently holds state for `name`, `description`, and `type`. Add `price` as a fourth editable field:

- State: `price: number | undefined` initialised from `meal.price` when entering edit mode
- Input: number input, `step=0.01`, `min=0`, optional (same as the create form)
- On save: include `price` in the existing `updateMeal` PATCH mutation payload
- On cancel: reset price state to the meal's current value
- On error: leave the edit row open; show the existing error toast pattern

**Shared interface fix required:** `IMealResponse` in `shared/src/interfaces/meal.ts` does not currently expose `price`. Add `price?: number` to `IMealResponse` so the inline edit row can read the current value.

**Backend response fix required:** `MealResponseDto` in `apps/server/src/core/meals/presentation/rest/dto/` must `@Expose()` the `price` field so it is included in API responses.

---

## 2. Menu Item Price Copy on Creation (Backend)

**File:** `apps/server/src/core/menu-items/application/menu-items.service.ts`

When creating a menu item, after validating the `mealId`, load the meal entity and copy its price:

```
menuItem.price = meal.price ?? null
```

No changes to:
- The create request DTO (`CreateMenuItemDto`) — price remains an optional client field but is ignored in favour of the server-side copy
- The shared `ICreateMenuItem` interface
- The frontend drag-and-drop code (`menu-period-builder.tsx`)

The existing constraint that blocks price updates on menu items when an active meal selection window exists (`menu-items.service.ts` update path) is untouched.

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| PATCH meal price fails | Edit row stays open, existing error toast shown |
| Meal not found during menu item creation | Creation fails (existing validation, no new surface) |
| Negative or non-numeric price input | Blocked by HTML5 `min=0` / `step=0.01` before request is made |

---

## Out of Scope

- Menu item price editing UI
- Price validation beyond HTML5 input constraints
- Retroactively updating existing menu item prices when a meal price changes
