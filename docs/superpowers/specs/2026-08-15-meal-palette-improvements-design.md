# Meal Palette UX Improvements

**Date:** 2026-08-15  
**Scope:** `apps/web` — `menu-period-builder` component tree  
**Status:** Approved

## Problem

When creating a menu period for an in-house supplier, the meal palette lists all meals without a height constraint. This forces the user to scroll the entire page rather than the palette itself. There is also no way to filter meals or create a missing meal without abandoning the current flow.

## Goals

1. Constrain the meal palette to a fixed scrollable height so the page does not grow.
2. Add client-side fuzzy search so users can quickly find meals by name.
3. Allow users to create a new meal inline, without navigating away from the menu period builder.

## Out of Scope

- Changing how meals are fetched (no pagination, no server-side search).
- Editing or deleting meals from within the builder.
- Any changes to the `DateGrid` or drag-and-drop logic.

---

## Design

### 1. Scroll & Height Constraint

**File:** `meal-palette.tsx`

The outer wrapper (`w-52 shrink-0 flex flex-col`) stays unchanged. A new inner `div` wraps only the grouped meal list and carries `overflow-y-auto max-h-[480px]`. The palette header (label, search bar, "+" button) sits above this scroll container and is never scrolled out of view.

480px is chosen as a reasonable height: tall enough to show ~10 meal cards without scrolling, short enough not to dominate the viewport on typical laptop screens.

### 2. Fuzzy Search

**Library:** `fuse.js`  
**Location:** state and Fuse instance live entirely inside `MealPalette`

A shadcn `Input` is placed between the "Meals" header and the scrollable list. Local `useState<string>` holds the query.

`useMemo` creates a `Fuse` instance from the full `meals` array:

```ts
new Fuse(meals, {
  keys: ['name'],
  threshold: 0.35,
  ignoreLocation: true,
  distance: 100,
})
```

- `threshold: 0.35` — catches common typos without surfacing false positives.
- `ignoreLocation: true` — matches anywhere in the name.
- `distance: 100` — appropriate for short food names.

When the query is non-empty, the displayed list is the Fuse result (ordered by relevance). When empty, the full `meals` array is used. The result is re-grouped by `MealType` before rendering — existing grouping logic is preserved.

Empty state: if no meals match the query, show `"No meals match your search."` inside the scroll container.

### 3. Inline Meal Creation Dialog

**Trigger:** A `+` icon button (`Button variant="ghost" size="icon"`) placed to the right of the "Meals" label. Clicking opens a shadcn `Dialog`.

**New component:** `CreateMealDialog`  
**Location:** co-located in `menu-period-builder/create-meal-dialog.tsx`

#### Props

```ts
interface CreateMealDialogProps {
  supplierId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
```

#### Form

Same Zod schema as the existing meal creation form on `InHouseSupplierDetailPage`:

```ts
z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(MealType),
  description: z.string().optional(),
  price: z.string().optional(),
})
```

Fields: name (required text input), type (required select), description (optional text input), price (optional number input, step 0.01, min 0).

#### Mutation

`CreateMealDialog` accesses `mealService` via `const { mealService } = useServices()` and calls `useMutation` directly. On success:

1. Invalidate the meals query (`['meals', 'supplier', supplierId]`) so the palette list refreshes.
2. Close the dialog (`onOpenChange(false)`).
3. Call `onSuccess()` — `MealPalette` uses this to clear the search input so the new meal is immediately visible.

#### MealPalette prop change

`MealPalette` receives one new prop: `supplierId: string`. `MenuPeriodBuilder` already receives `period: IMenuPeriodResponse`, and `IMenuPeriodResponse` already has `supplierId: string`, so `MenuPeriodBuilder` passes `period.supplierId` down. No changes needed in `InHouseSupplierDetailPage`.

---

## Component Responsibilities After Change

| Component | Change |
|---|---|
| `MealPalette` | Add search state, Fuse instance, scroll container, `+` button, `supplierId` prop |
| `CreateMealDialog` | New component — form + mutation for inline meal creation |
| `MenuPeriodBuilder` | Thread `supplierId` prop down to `MealPalette` |
| `InHouseSupplierDetailPage` | No changes needed |
| Everything else | Unchanged |

---

## Dependencies

- `fuse.js` — add to `apps/web` package.json (or root workspace if already used elsewhere).
- shadcn `Dialog` — install with `npx shadcn@latest add dialog` if not already present.

---

## Testing Checklist

- Palette scrolls internally; page does not scroll when mousing over the palette list.
- Search with exact substring works (e.g., "chicken").
- Search with typo works (e.g., "chikn" → "Chicken Soup").
- Empty query shows all meals grouped by type.
- No results shows empty state message.
- "+" button opens dialog.
- Dialog form validates (name and type required).
- Submitting the form creates the meal and it appears in the palette.
- Search is cleared after successful meal creation.
- Dialog closes on success and on cancel/escape.
