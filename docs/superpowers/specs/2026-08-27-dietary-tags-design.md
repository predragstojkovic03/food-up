# Dietary Tags on Meals

**Date:** 2026-08-27  
**Status:** Approved

## Overview

Add a set of app-defined dietary labels to meals so employees can identify at a glance whether a meal suits their diet (vegetarian, vegan, lenten, chrono, etc.). Tags are informational badges only — no filtering is required. Tags are assigned by whoever can edit a meal (supplier or manager for in-house suppliers).

---

## Tag Set

```typescript
export enum DietaryTag {
  Vegetarian = 'vegetarian',
  Vegan = 'vegan',
  Lenten = 'lenten',
  Chrono = 'chrono',
  GlutenFree = 'gluten_free',
  DairyFree = 'dairy_free',
  Halal = 'halal',
}
```

---

## Backend

### Shared package (`shared/`)

- **New file** `shared/src/enums/dietary-tag.enum.ts` — defines `DietaryTag` enum above.
- **Export** from `shared/src/index.ts`.
- **Update** `shared/src/interfaces/meal.ts`:
  - `ICreateMeal` — add `dietaryTags?: DietaryTag[]`
  - `IUpdateMeal` — inherits via `Partial<ICreateMeal>`
  - `IMealResponse` — add `dietaryTags: DietaryTag[]`

### Domain entity (`apps/server/src/core/meals/domain/meal.entity.ts`)

- Add `dietaryTags: DietaryTag[]` to the props type.
- `create()` accepts `dietaryTags?: DietaryTag[]`, defaults to `[]`.
- `reconstitute()` accepts `dietaryTags: DietaryTag[]`.
- Add getter `get dietaryTags()`.

### TypeORM entity (`apps/server/src/core/meals/infrastructure/persistence/meal.typeorm-entity.ts`)

```typescript
@Column({ type: 'text', array: true, default: '{}' })
dietaryTags: string[];
```

Native PostgreSQL `text[]` column. Defaults to empty array. `ORM_SYNC` will apply the column automatically in dev.

### Mapper (`apps/server/src/core/meals/infrastructure/persistence/meal.typeorm-mapper.ts`)

- Map `dietaryTags` through in both directions (persistence ↔ domain).
- Cast `string[]` → `DietaryTag[]` when reading from DB.

### Presentation DTOs

**`create-meal.dto.ts`:**
```typescript
@IsArray()
@IsEnum(DietaryTag, { each: true })
@IsOptional()
dietaryTags?: DietaryTag[];
```

**`meal-response.dto.ts`:**
```typescript
@Expose()
dietaryTags: DietaryTag[];
```

No changes to repository interfaces or service logic — the field rides along with existing save/find.

---

## Frontend

### i18n

Add a `dietaryTags` block to both locale files.

**`apps/web/src/i18n/en/meals.json`:**
```json
"dietaryTags": {
  "vegetarian": "Vegetarian",
  "vegan": "Vegan",
  "lenten": "Lenten",
  "chrono": "Chrono",
  "gluten_free": "Gluten Free",
  "dairy_free": "Dairy Free",
  "halal": "Halal"
}
```

**`apps/web/src/i18n/sr/meals.json`:**
```json
"dietaryTags": {
  "vegetarian": "Vegetarijansko",
  "vegan": "Vegansko",
  "lenten": "Posno",
  "chrono": "Krono",
  "gluten_free": "Bez glutena",
  "dairy_free": "Bez mlečnih proizvoda",
  "halal": "Halal"
}
```

### Shared `DietaryTagBadge` component

New component at `apps/web/src/shared/presentation/components/dietary-tag-badge.tsx`.

- Props: `tag: DietaryTag`
- Uses `useTranslation('meals')` → `t('dietaryTags.<tag>')`
- Renders a small shadcn `Badge` with a consistent color per tag (e.g. green for vegetarian/vegan, blue for lenten, orange for chrono, etc.)

### Shared `DietaryTagsSelect` component

New component at `apps/web/src/shared/presentation/components/dietary-tags-select.tsx`.

- Props: `value: DietaryTag[]`, `onChange: (tags: DietaryTag[]) => void`
- Renders a toggle-button group (or checkbox list) over all `DietaryTag` values
- Labels come from i18n via `DietaryTagBadge` (or the same translation key)
- Used in all three meal create/edit surfaces below

### Form surfaces (all need the tags multi-select added)

1. **Create meal dialog** — `apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/create-meal-dialog.tsx`  
   Add `DietaryTagsSelect` below the existing fields. Field is optional (defaults to `[]`).

2. **Meals tab add form** — inline form inside `MealsTab` in `apps/web/src/features/suppliers/presentation/pages/in-house-supplier-detail.page.tsx`  
   Same addition as above.

3. **Inline meal editor (`MealRow`)** — same file, inline edit mode  
   Add `DietaryTagsSelect` so tags can be changed when editing an existing meal.

### Badge display surfaces

1. **Meal palette card** — `apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/draggable-meal-card.tsx`  
   Render `<DietaryTagBadge>` for each tag on the meal, below the meal name/type.

2. **Employee meal selection UI** — wherever meal cards are rendered in the employee flow  
   Same badge rendering. Exact component to be confirmed during implementation.

---

## Out of Scope

- Filtering meals by dietary tag (can be added later)
- i18n-ifying existing hardcoded `MealType` labels (separate task)
