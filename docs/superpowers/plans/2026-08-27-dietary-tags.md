# Dietary Tags on Meals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed set of dietary labels (`DietaryTag` enum) to meals, stored as a PostgreSQL `text[]` array, displayed as i18n badges for employees, and editable via multi-select in all meal create/edit surfaces.

**Architecture:** `DietaryTag` lives in `shared/`, rides on the `Meal` domain entity, flows through backend DTOs and the menu-items query chain, and surfaces in two frontend primitives: `DietaryTagBadge` (read) and `DietaryTagsSelect` (write). Backend changes are sequential (shared → domain → persistence → DTOs → query chain). Frontend changes are independent of each other after the shared types land.

**Tech Stack:** NestJS 11, TypeORM 0.3, PostgreSQL 17, React 19, i18next, React Hook Form + Zod, shadcn/ui Badge + Button, Tailwind CSS v4

**Spec:** `docs/superpowers/specs/2026-08-27-dietary-tags-design.md`

## Global Constraints

- `DietaryTag` enum string values: `vegetarian`, `vegan`, `lenten`, `chrono`, `gluten_free`, `dairy_free`, `halal`
- `lenten` is the in-code English term; Serbian display is "Posno" (i18n only)
- No filtering by tag — badges are informational only
- No `any` types in frontend TypeScript
- All i18n strings added to both `en/meals.json` and `sr/meals.json` under `dietaryTags`
- shadcn `Badge` and `Button` are already installed — do not install new shadcn components
- `DietaryTagBadge` → `apps/web/src/components/dietary-tag-badge.tsx` (multi-feature usage)
- `DietaryTagsSelect` → `apps/web/src/features/suppliers/presentation/pages/components/dietary-tags-select.tsx` (single-feature usage)
- `ORM_SYNC=true` in dev — no manual migration needed

---

### Task 1: shared/ — DietaryTag enum + interface updates

**Files:**
- Create: `shared/src/enums/dietary-tag.enum.ts`
- Modify: `shared/src/enums/index.ts`
- Modify: `shared/src/interfaces/meal.ts`
- Modify: `shared/src/interfaces/meal-selection-window.ts`

**Interfaces:**
- Produces: `DietaryTag` enum, updated `ICreateMeal`, `IMealResponse`, `IWindowMenuItemMeal` — consumed by all subsequent tasks

- [ ] **Step 1: Create `shared/src/enums/dietary-tag.enum.ts`**

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

- [ ] **Step 2: Export from `shared/src/enums/index.ts`**

Add after the existing exports:
```typescript
export * from './dietary-tag.enum';
```

- [ ] **Step 3: Update `shared/src/interfaces/meal.ts`**

```typescript
import { DietaryTag } from '../enums/dietary-tag.enum';
import { MealType } from '../enums/meal-type.enum';

export interface ICreateMeal {
  name: string;
  description?: string;
  type: MealType;
  price?: number;
  supplierId?: string;
  dietaryTags?: DietaryTag[];
}

export interface IUpdateMeal extends Partial<ICreateMeal> {}

export interface IMealResponse {
  id: string;
  name: string;
  description?: string;
  type: MealType;
  price?: number;
  dietaryTags: DietaryTag[];
}
```

- [ ] **Step 4: Update `shared/src/interfaces/meal-selection-window.ts`**

Add import and update `IWindowMenuItemMeal`:
```typescript
import { DietaryTag } from '../enums/dietary-tag.enum';
import { MealType } from '../enums/meal-type.enum';

// ... keep all other interfaces unchanged ...

export interface IWindowMenuItemMeal {
  name: string;
  description: string;
  type: MealType;
  dietaryTags: DietaryTag[];
}
```

- [ ] **Step 5: Build shared to verify**

Run: `npm run build --workspace=shared`
Expected: Exits 0 with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add shared/src/enums/dietary-tag.enum.ts shared/src/enums/index.ts shared/src/interfaces/meal.ts shared/src/interfaces/meal-selection-window.ts
git commit -m "feat(shared): add DietaryTag enum and update meal interfaces"
```

---

### Task 2: Domain entity — dietaryTags field + unit tests

**Files:**
- Modify: `apps/server/src/core/meals/domain/meal.entity.ts`
- Modify: `apps/server/src/core/meals/domain/meal.entity.spec.ts`

**Interfaces:**
- Consumes: `DietaryTag` from `@food-up/shared` (Task 1)
- Produces: `Meal.create(name, description, type, supplierId, price?, dietaryTags?)` and `Meal.reconstitute(..., dietaryTags)` signatures — consumed by Tasks 3, 4

- [ ] **Step 1: Write failing tests in `meal.entity.spec.ts`**

Append to the existing file (keep existing tests):

```typescript
describe('Meal dietary tags', () => {
  it('defaults to empty array when not provided in create()', () => {
    const meal = Meal.create('Soup', undefined, MealType.Soup, 'supplier-1');
    expect(meal.dietaryTags).toEqual([]);
  });

  it('stores provided dietaryTags in create()', () => {
    const meal = Meal.create('Salad', undefined, MealType.Salad, 'supplier-1', undefined, [DietaryTag.Vegetarian, DietaryTag.Vegan]);
    expect(meal.dietaryTags).toEqual([DietaryTag.Vegetarian, DietaryTag.Vegan]);
  });

  it('stores dietaryTags in reconstitute()', () => {
    const meal = Meal.reconstitute('id-1', 'Soup', undefined, MealType.Soup, 'supplier-1', undefined, [DietaryTag.Lenten]);
    expect(meal.dietaryTags).toEqual([DietaryTag.Lenten]);
  });

  it('defaults to empty array in reconstitute() when not provided', () => {
    const meal = Meal.reconstitute('id-1', 'Soup', undefined, MealType.Soup, 'supplier-1');
    expect(meal.dietaryTags).toEqual([]);
  });
});
```

Add to the imports at top of the spec file:
```typescript
import { DietaryTag, MealType } from '@food-up/shared';
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test --workspace=apps/server -- --testPathPattern="meal.entity.spec"`
Expected: FAIL — `meal.dietaryTags` is not defined.

- [ ] **Step 3: Update `meal.entity.ts`**

```typescript
import { DietaryTag, MealType } from '@food-up/shared';
import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';

export class Meal extends Entity {
  static create(
    name: string,
    description: string | undefined,
    type: MealType,
    supplierId: string,
    price?: number,
    dietaryTags: DietaryTag[] = [],
  ): Meal {
    return new Meal(generateId(), name, description, type, supplierId, price, dietaryTags);
  }

  static reconstitute(
    id: string,
    name: string,
    description: string | null | undefined,
    type: MealType,
    supplierId: string,
    price?: number,
    dietaryTags: DietaryTag[] = [],
  ): Meal {
    return new Meal(id, name, description ?? undefined, type, supplierId, price, dietaryTags);
  }

  private constructor(
    public readonly id: string,
    public name: string,
    public description: string | undefined,
    public type: MealType,
    public readonly supplierId: string,
    public price?: number,
    public dietaryTags: DietaryTag[] = [],
  ) {
    super();
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test --workspace=apps/server -- --testPathPattern="meal.entity.spec"`
Expected: All tests pass (both existing and new).

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/core/meals/domain/meal.entity.ts apps/server/src/core/meals/domain/meal.entity.spec.ts
git commit -m "feat(server): add dietaryTags to Meal domain entity"
```

---

### Task 3: TypeORM entity + mapper

**Files:**
- Modify: `apps/server/src/core/meals/infrastructure/persistence/meal.typeorm-entity.ts`
- Modify: `apps/server/src/core/meals/infrastructure/persistence/meal-typeorm.mapper.ts`

**Interfaces:**
- Consumes: `DietaryTag` (Task 1), `Meal.dietaryTags` field (Task 2)
- Produces: DB column `dietary_tags text[]` and mapper bidirectional mapping — consumed by Task 4

- [ ] **Step 1: Add `dietaryTags` column to `meal.typeorm-entity.ts`**

```typescript
import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { Supplier } from 'src/core/suppliers/infrastructure/persistence/supplier.typeorm-entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { DietaryTag, MealType } from '@food-up/shared';

@Entity()
export class Meal {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column('enum', { enum: MealType })
  type: MealType;

  @ManyToOne(() => Supplier, (supplier) => supplier.meals, { eager: true })
  supplier: Supplier;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: { from: (v: string | null) => (v != null ? Number(v) : undefined), to: (v) => v },
  })
  price?: number;

  @Column({ type: 'text', array: true, default: '{}' })
  dietaryTags: string[];

  @OneToMany(() => MenuItem, (menuItem) => menuItem.meal)
  menuItems: MenuItem[];
}
```

- [ ] **Step 2: Update `meal-typeorm.mapper.ts` — all three methods**

```typescript
import { DietaryTag } from '@food-up/shared';
import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { Meal as MealDomain } from '../../domain/meal.entity';
import { Meal as MealPersistence } from './meal.typeorm-entity';

export class MealTypeOrmMapper extends TypeOrmMapper<MealDomain, MealPersistence> {
  toDomain(persistence: MealPersistence): MealDomain {
    return MealDomain.reconstitute(
      persistence.id,
      persistence.name,
      persistence.description ?? undefined,
      persistence.type,
      persistence.supplier?.id,
      persistence.price,
      (persistence.dietaryTags ?? []) as DietaryTag[],
    );
  }

  toPersistence(domain: MealDomain): MealPersistence {
    const persistence = new MealPersistence();
    persistence.id = domain.id;
    persistence.name = domain.name;
    persistence.description = domain.description;
    persistence.type = domain.type;
    persistence.supplier = domain.supplierId ? ({ id: domain.supplierId } as any) : undefined;
    persistence.price = domain.price;
    persistence.dietaryTags = domain.dietaryTags ?? [];
    return persistence;
  }

  toPersistencePartial(domain: Partial<MealDomain>): Partial<MealPersistence> {
    const persistence: Partial<MealPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.name !== undefined) persistence.name = domain.name;
    if (domain.description !== undefined) persistence.description = domain.description;
    if (domain.type !== undefined) persistence.type = domain.type;
    if (domain.price !== undefined) persistence.price = domain.price;
    if (domain.supplierId !== undefined) persistence.supplier = { id: domain.supplierId } as any;
    if (domain.dietaryTags !== undefined) persistence.dietaryTags = domain.dietaryTags;
    return persistence;
  }
}
```

- [ ] **Step 3: Build server to verify types**

Run: `npm run build --workspace=apps/server`
Expected: Exits 0. `ORM_SYNC=true` will add the `dietary_tags text[]` column when the server next starts.

- [ ] **Step 4: Commit**

```bash
git add apps/server/src/core/meals/infrastructure/persistence/meal.typeorm-entity.ts apps/server/src/core/meals/infrastructure/persistence/meal-typeorm.mapper.ts
git commit -m "feat(server): add dietary_tags column to meal persistence and update mapper"
```

---

### Task 4: Presentation DTOs + service wiring

**Files:**
- Modify: `apps/server/src/core/meals/presentation/rest/dto/create-meal.dto.ts`
- Modify: `apps/server/src/core/meals/presentation/rest/dto/meal-response.dto.ts`
- Modify: `apps/server/src/core/meals/application/meals.service.ts`

**Interfaces:**
- Consumes: `DietaryTag` (Task 1), `Meal.create(..., dietaryTags)` (Task 2)
- Produces: `POST /meals` accepts `dietaryTags`; `GET /meals` responses include `dietaryTags`

- [ ] **Step 1: Update `create-meal.dto.ts`**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DietaryTag, MealType } from '@food-up/shared';

export class CreateMealDto {
  @ApiProperty({ example: 'Chicken Sandwich', description: 'Name of the meal' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Grilled chicken with lettuce',
    description: 'Description of the meal',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: MealType.Lunch, enum: MealType, description: 'Meal type' })
  @IsEnum(MealType)
  type: MealType;

  @ApiProperty({ example: 9.99, description: 'Price of the meal', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: '12345678901234567890123456',
    description: 'ID of the supplier providing the meal. It should be provided only for managed suppliers.',
    required: false,
  })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiProperty({
    example: [DietaryTag.Vegetarian],
    enum: DietaryTag,
    isArray: true,
    description: 'Dietary labels for the meal',
    required: false,
  })
  @IsArray()
  @IsEnum(DietaryTag, { each: true })
  @IsOptional()
  dietaryTags?: DietaryTag[];
}
```

- [ ] **Step 2: Update `meal-response.dto.ts`**

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { DietaryTag, MealType } from '@food-up/shared';

@Expose()
export class MealResponseDto {
  @Expose()
  @ApiProperty({ example: 'meal-uuid', description: 'Meal ID' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Chicken Sandwich', description: 'Name of the meal' })
  name: string;

  @Expose()
  @ApiProperty({
    example: 'Grilled chicken with lettuce',
    description: 'Description of the meal',
    required: false,
    nullable: true,
  })
  description?: string;

  @Expose()
  @ApiProperty({ example: MealType.Lunch, enum: MealType, description: 'Meal type' })
  type: MealType;

  @Expose()
  @ApiProperty({ example: 450.0, description: 'Price of the meal in RSD', required: false, nullable: true })
  price?: number;

  @Expose()
  @ApiProperty({ example: [DietaryTag.Vegetarian], enum: DietaryTag, isArray: true, description: 'Dietary labels' })
  dietaryTags: DietaryTag[];
}
```

- [ ] **Step 3: Update `meals.service.ts` — pass `dietaryTags` through `Meal.create()`**

Find this block in `create()`:
```typescript
const meal = Meal.create(
  dto.name,
  dto.description,
  dto.type,
  supplierId,
  dto.price,
);
```

Replace with:
```typescript
const meal = Meal.create(
  dto.name,
  dto.description,
  dto.type,
  supplierId,
  dto.price,
  dto.dietaryTags ?? [],
);
```

(No change needed to `update()` — the spread `{ ...existing, ...dto }` already merges `dietaryTags` from the DTO into the persistence partial, and `toPersistencePartial` now handles it.)

- [ ] **Step 4: Build server to verify**

Run: `npm run build --workspace=apps/server`
Expected: Exits 0.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/core/meals/presentation/rest/dto/create-meal.dto.ts apps/server/src/core/meals/presentation/rest/dto/meal-response.dto.ts apps/server/src/core/meals/application/meals.service.ts
git commit -m "feat(server): expose dietaryTags in meal DTOs and wire through service"
```

---

### Task 5: Menu items query chain — expose dietaryTags in window API response

**Files:**
- Modify: `apps/server/src/core/menu-items/application/queries/dto/find-menu-items-with-meals.dto.ts`
- Modify: `apps/server/src/core/menu-items/infrastructure/persistence/menu-items-query-typeorm.repository.ts`
- Modify: `apps/server/src/core/meal-selection-windows/presentation/rest/dto/window-menu-item-response.dto.ts`

**Interfaces:**
- Consumes: `DietaryTag` (Task 1), `IWindowMenuItemMeal.dietaryTags` (Task 1)
- Produces: `GET /meal-selection-windows/current` response includes `meal.dietaryTags` on each menu item

- [ ] **Step 1: Update `find-menu-items-with-meals.dto.ts`**

```typescript
import { DietaryTag, MealType } from '@food-up/shared';

type MealDto = {
  name: string;
  description?: string;
  type: MealType;
  dietaryTags: DietaryTag[];
};

export type MenuItemWithMealDto = {
  id: string;
  day: string;
  price?: number;
  supplierId: string;
  supplierName: string;
  meal: MealDto;
};
```

- [ ] **Step 2: Update `menu-items-query-typeorm.repository.ts` — include dietaryTags in mapped result**

Replace the `meal` object in `findWithMealsByMenuPeriodIds`:
```typescript
return menuItems.map((menuItem) => ({
  id: menuItem.id,
  day: menuItem.day,
  price: menuItem.price ?? undefined,
  supplierId: menuItem.menuPeriod.supplierId,
  supplierName: menuItem.menuPeriod.supplier.name,
  meal: {
    name: menuItem.meal.name,
    description: menuItem.meal.description,
    type: menuItem.meal.type,
    dietaryTags: (menuItem.meal.dietaryTags ?? []) as DietaryTag[],
  },
}));
```

Add import at top:
```typescript
import { DietaryTag } from '@food-up/shared';
```

- [ ] **Step 3: Update `window-menu-item-response.dto.ts`**

```typescript
import { DietaryTag, IWindowMenuItemMeal, IWindowMenuItemResponse, MealType } from '@food-up/shared';
import { Expose, Type } from 'class-transformer';

export class WindowMenuItemMealDto implements IWindowMenuItemMeal {
  @Expose() name: string;
  @Expose() description: string;
  @Expose() type: MealType;
  @Expose() dietaryTags: DietaryTag[];
}

export class WindowMenuItemResponseDto implements IWindowMenuItemResponse {
  @Expose() id: string;
  @Expose() day: string;
  @Expose() price?: number;
  @Expose() supplierId: string;
  @Expose() supplierName: string;

  @Expose()
  @Type(() => WindowMenuItemMealDto)
  meal: WindowMenuItemMealDto;
}
```

- [ ] **Step 4: Build server to verify**

Run: `npm run build --workspace=apps/server`
Expected: Exits 0.

- [ ] **Step 5: Commit**

```bash
git add apps/server/src/core/menu-items/application/queries/dto/find-menu-items-with-meals.dto.ts apps/server/src/core/menu-items/infrastructure/persistence/menu-items-query-typeorm.repository.ts apps/server/src/core/meal-selection-windows/presentation/rest/dto/window-menu-item-response.dto.ts
git commit -m "feat(server): include dietaryTags in menu item window query response"
```

---

### Task 6: i18n translations

**Files:**
- Modify: `apps/web/src/i18n/en/meals.json`
- Modify: `apps/web/src/i18n/sr/meals.json`

**Interfaces:**
- Produces: `t('dietaryTags.<tag>', { ns: 'meals' })` and `t('dietaryTags.label', { ns: 'meals' })` — consumed by Tasks 7, 8

- [ ] **Step 1: Add `dietaryTags` block to `apps/web/src/i18n/en/meals.json`**

Add at the top level of the JSON object (alongside `"selectionFlow"`, `"windows"`, etc.):
```json
"dietaryTags": {
  "label": "Dietary tags",
  "vegetarian": "Vegetarian",
  "vegan": "Vegan",
  "lenten": "Lenten",
  "chrono": "Chrono",
  "gluten_free": "Gluten Free",
  "dairy_free": "Dairy Free",
  "halal": "Halal"
}
```

- [ ] **Step 2: Add `dietaryTags` block to `apps/web/src/i18n/sr/meals.json`**

Add at the top level of the JSON object:
```json
"dietaryTags": {
  "label": "Dijetetske oznake",
  "vegetarian": "Vegetarijansko",
  "vegan": "Vegansko",
  "lenten": "Posno",
  "chrono": "Krono",
  "gluten_free": "Bez glutena",
  "dairy_free": "Bez mlečnih proizvoda",
  "halal": "Halal"
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/i18n/en/meals.json apps/web/src/i18n/sr/meals.json
git commit -m "feat(web): add dietaryTags i18n translations (en + sr)"
```

---

### Task 7: DietaryTagBadge shared component

**Files:**
- Create: `apps/web/src/components/dietary-tag-badge.tsx`

**Interfaces:**
- Consumes: `DietaryTag` (Task 1), `t('dietaryTags.<tag>', { ns: 'meals' })` (Task 6)
- Produces: `<DietaryTagBadge tag={DietaryTag.Vegetarian} />` — consumed by Tasks 9, 10, 11

- [ ] **Step 1: Create `apps/web/src/components/dietary-tag-badge.tsx`**

```tsx
import { DietaryTag } from '@food-up/shared';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

const TAG_CLASSES: Record<DietaryTag, string> = {
  [DietaryTag.Vegetarian]: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  [DietaryTag.Vegan]: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
  [DietaryTag.Lenten]: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  [DietaryTag.Chrono]: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100',
  [DietaryTag.GlutenFree]: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100',
  [DietaryTag.DairyFree]: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100',
  [DietaryTag.Halal]: 'bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100',
};

interface DietaryTagBadgeProps {
  tag: DietaryTag;
}

export function DietaryTagBadge({ tag }: DietaryTagBadgeProps) {
  const { t } = useTranslation('meals');
  return (
    <Badge variant='outline' className={`text-xs font-normal ${TAG_CLASSES[tag]}`}>
      {t(`dietaryTags.${tag}`)}
    </Badge>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/dietary-tag-badge.tsx
git commit -m "feat(web): add DietaryTagBadge shared component"
```

---

### Task 8: DietaryTagsSelect component

**Files:**
- Create: `apps/web/src/features/suppliers/presentation/pages/components/dietary-tags-select.tsx`

**Interfaces:**
- Consumes: `DietaryTag` (Task 1), `t('dietaryTags.<tag>', { ns: 'meals' })` (Task 6)
- Produces: `<DietaryTagsSelect value={DietaryTag[]} onChange={(tags) => void} />` — consumed by Tasks 10, 11

- [ ] **Step 1: Create `apps/web/src/features/suppliers/presentation/pages/components/dietary-tags-select.tsx`**

```tsx
import { DietaryTag } from '@food-up/shared';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface DietaryTagsSelectProps {
  value: DietaryTag[];
  onChange: (tags: DietaryTag[]) => void;
}

export function DietaryTagsSelect({ value, onChange }: DietaryTagsSelectProps) {
  const { t } = useTranslation('meals');

  function toggle(tag: DietaryTag) {
    if (value.includes(tag)) {
      onChange(value.filter((v) => v !== tag));
    } else {
      onChange([...value, tag]);
    }
  }

  return (
    <div className='flex flex-wrap gap-1.5'>
      {Object.values(DietaryTag).map((tag) => (
        <Button
          key={tag}
          type='button'
          size='sm'
          variant={value.includes(tag) ? 'default' : 'outline'}
          onClick={() => toggle(tag)}
          className='h-7 text-xs'
        >
          {t(`dietaryTags.${tag}`)}
        </Button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/features/suppliers/presentation/pages/components/dietary-tags-select.tsx
git commit -m "feat(web): add DietaryTagsSelect component"
```

---

### Task 9: Employee meal selection — type update + MealCard badges

**Files:**
- Modify: `apps/web/src/features/meal-selections/presentation/pages/types.ts`
- Modify: `apps/web/src/features/meal-selections/presentation/pages/meal-selection-flow.page.tsx`
- Modify: `apps/web/src/features/meal-selections/presentation/pages/components/meal-card.tsx`

**Interfaces:**
- Consumes: `DietaryTag` (Task 1), `IWindowMenuItemMeal.dietaryTags` (Task 1), `DietaryTagBadge` (Task 7)
- Produces: meal cards in the employee selection flow show dietary tag badges

- [ ] **Step 1: Update `types.ts` — add `dietaryTags` to `MenuItemOption`**

```typescript
import { DietaryTag, MealType } from '@food-up/shared';

export interface MenuItemOption {
  id: string;
  name: string;
  description?: string;
  type: MealType;
  price?: number;
  dietaryTags?: DietaryTag[];
}

export interface DaySelection {
  date: string;
  skipped: boolean;
  choices: Partial<Record<MealType, string>>;
  existingIds: Partial<Record<MealType, string>>;
}
```

- [ ] **Step 2: Update `meal-selection-flow.page.tsx` — include `dietaryTags` in `buildItemsByType` and `allItems`**

In `buildItemsByType`, update the push:
```typescript
result[type]!.push({
  id: item.id,
  name: item.meal.name,
  description: item.meal.description,
  type,
  price: item.price,
  dietaryTags: item.meal.dietaryTags,
});
```

Update `allItems`:
```typescript
const allItems: MenuItemOption[] = windowData
  ? windowData.menuItems.map((i) => ({
      id: i.id,
      name: i.meal.name,
      description: i.meal.description,
      type: i.meal.type,
      price: i.price,
      dietaryTags: i.meal.dietaryTags,
    }))
  : [];
```

- [ ] **Step 3: Update `meal-card.tsx` — render dietary tag badges**

```tsx
import { MenuItemOption } from '../types';
import { DietaryTagBadge } from '@/components/dietary-tag-badge';

interface MealCardProps {
  item: MenuItemOption;
  selected: boolean;
  onSelect: () => void;
}

export function MealCard({ item, selected, onSelect }: MealCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 transition-all active:scale-[0.98] ${
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border bg-card hover:border-primary/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-snug">{item.name}</p>
          {item.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {item.description}
            </p>
          )}
          {item.dietaryTags && item.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.dietaryTags.map((tag) => (
                <DietaryTagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className={`size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected ? 'border-primary bg-primary' : 'border-border'
            }`}
          >
            {selected && (
              <svg
                viewBox="0 0 10 8"
                className="size-3 text-primary-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
        </div>
      </div>
    </button>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/meal-selections/presentation/pages/types.ts apps/web/src/features/meal-selections/presentation/pages/meal-selection-flow.page.tsx apps/web/src/features/meal-selections/presentation/pages/components/meal-card.tsx
git commit -m "feat(web): show dietary tag badges on employee meal selection cards"
```

---

### Task 10: Supplier meal palette + CreateMealDialog

**Files:**
- Modify: `apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/draggable-meal-card.tsx`
- Modify: `apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/create-meal-dialog.tsx`

**Interfaces:**
- Consumes: `IMealResponse.dietaryTags` (Task 1), `DietaryTagBadge` (Task 7), `DietaryTagsSelect` (Task 8)
- Produces: palette meal cards show badges; the create-meal dialog sends `dietaryTags`

- [ ] **Step 1: Update `draggable-meal-card.tsx` — show dietary tag badges**

```tsx
import { IMealResponse } from '@food-up/shared';
import { useDraggable } from '@dnd-kit/core';
import { DietaryTagBadge } from '@/components/dietary-tag-badge';

interface DraggableMealCardProps {
  meal: IMealResponse;
}

export function DraggableMealCard({ meal }: DraggableMealCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: meal.id,
    data: { meal },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        px-3 py-2 rounded-md border bg-card text-sm font-medium
        cursor-grab active:cursor-grabbing select-none
        hover:border-primary/50 hover:bg-accent transition-colors
        ${isDragging ? 'opacity-40' : ''}
      `}
    >
      <span>{meal.name}</span>
      {meal.dietaryTags && meal.dietaryTags.length > 0 && (
        <div className='flex flex-wrap gap-1 mt-1.5'>
          {meal.dietaryTags.map((tag) => (
            <DietaryTagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update `create-meal-dialog.tsx` — add `dietaryTags` to schema, form, and submit**

Add imports:
```typescript
import { DietaryTag, MealType } from '@food-up/shared';
import { DietaryTagsSelect } from '../dietary-tags-select';
```

Update schema:
```typescript
const createMealSchema = z.object({
  name: z.string().min(1, t('menuPeriodBuilder.createMeal.nameRequired')),
  type: z.nativeEnum(MealType),
  description: z.string().optional(),
  price: z.string().optional(),
  dietaryTags: z.array(z.nativeEnum(DietaryTag)).default([]),
});
type FormValues = z.infer<typeof createMealSchema>;
```

Update `useForm` default values:
```typescript
defaultValues: { name: '', type: MealType.Lunch, description: '', price: '', dietaryTags: [] },
```

Update `handleSubmit`:
```typescript
function handleSubmit(values: FormValues) {
  createMeal.mutate(
    {
      name: values.name,
      type: values.type,
      description: values.description || undefined,
      price: values.price ? Number(values.price) : undefined,
      supplierId,
      dietaryTags: values.dietaryTags,
    },
    {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
        onSuccess();
      },
    },
  );
}
```

Add `FormField` for dietary tags inside the `<form>` grid, after the `price` field and before the button row:
```tsx
<FormField
  control={form.control}
  name='dietaryTags'
  render={({ field }) => (
    <FormItem className='col-span-2'>
      <FormLabel>{t('dietaryTags.label', { ns: 'meals' })}</FormLabel>
      <FormControl>
        <DietaryTagsSelect value={field.value} onChange={field.onChange} />
      </FormControl>
    </FormItem>
  )}
/>
```

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/draggable-meal-card.tsx apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/create-meal-dialog.tsx
git commit -m "feat(web): add dietary tag badges to meal palette and create-meal dialog"
```

---

### Task 11: In-house supplier detail — create form + MealRow edit + MealRow display

**Files:**
- Modify: `apps/web/src/features/suppliers/presentation/pages/in-house-supplier-detail.page.tsx`

**Interfaces:**
- Consumes: `IMealResponse.dietaryTags` (Task 1), `DietaryTag` (Task 1), `DietaryTagBadge` (Task 7), `DietaryTagsSelect` (Task 8)
- Produces: Meals tab create form and inline edit include `dietaryTags`; read view shows badges

- [ ] **Step 1: Add imports at the top of `in-house-supplier-detail.page.tsx`**

Add to existing imports:
```typescript
import { DietaryTag } from '@food-up/shared';
import { DietaryTagBadge } from '@/components/dietary-tag-badge';
import { DietaryTagsSelect } from './components/dietary-tags-select';
```

- [ ] **Step 2: Update `MealsTab` — create form schema and submit**

Update `createMealSchema`:
```typescript
const createMealSchema = z.object({
  name: z.string().min(1, t('detail.meals.createForm.nameRequired')),
  description: z.string().optional(),
  type: z.nativeEnum(MealType),
  price: z.string().optional(),
  dietaryTags: z.array(z.nativeEnum(DietaryTag)).default([]),
});
type CreateMealFormValues = z.infer<typeof createMealSchema>;
```

Update `useForm` default values:
```typescript
defaultValues: { name: '', description: '', type: MealType.Lunch, price: '', dietaryTags: [] },
```

Update `handleCreate`:
```typescript
function handleCreate(values: CreateMealFormValues) {
  createMeal.mutate(
    {
      name: values.name,
      description: values.description || undefined,
      type: values.type,
      price: values.price ? Number(values.price) : undefined,
      supplierId,
      dietaryTags: values.dietaryTags,
    },
    {
      onSuccess: () => {
        createMealForm.reset();
        setShowCreate(false);
      },
    },
  );
}
```

Add `FormField` for dietary tags inside the create form grid, after the `price` field and before the submit button `<div>`:
```tsx
<FormField
  control={createMealForm.control}
  name='dietaryTags'
  render={({ field }) => (
    <FormItem className='col-span-2'>
      <FormLabel className='text-xs'>{t('dietaryTags.label', { ns: 'meals' })}</FormLabel>
      <FormControl>
        <DietaryTagsSelect value={field.value} onChange={field.onChange} />
      </FormControl>
    </FormItem>
  )}
/>
```

- [ ] **Step 3: Update `updateMeal` mutation signature in `MealsTab`**

```typescript
const updateMeal = useMutation({
  mutationFn: (payload: { id: string; name?: string; description?: string; type?: MealType; price?: number; dietaryTags?: DietaryTag[] }) => {
    const { id, ...data } = payload;
    return mealService.update(id, data);
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
});
```

- [ ] **Step 4: Update `MealRowProps` to include `dietaryTags` in `onUpdate`**

```typescript
interface MealRowProps {
  meal: IMealResponse;
  isUpdating: boolean;
  isRemoving: boolean;
  onUpdate: (data: { name?: string; description?: string; type?: MealType; price?: number; dietaryTags?: DietaryTag[] }) => void;
  onRemove: () => void;
}
```

- [ ] **Step 5: Update `MealRow` — add state, edit controls, and badge display**

Add `dietaryTags` state inside `MealRow` (alongside the existing `useState` calls):
```typescript
const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>(meal.dietaryTags ?? []);
```

Update `handleSave`:
```typescript
function handleSave() {
  onUpdate({
    name,
    description: description || undefined,
    type,
    price: price !== '' ? Number(price) : undefined,
    dietaryTags,
  });
  setEditing(false);
}
```

Update `handleCancel`:
```typescript
function handleCancel() {
  setName(meal.name);
  setDescription(meal.description ?? '');
  setType(meal.type);
  setPrice(meal.price != null ? String(meal.price) : '');
  setDietaryTags(meal.dietaryTags ?? []);
  setEditing(false);
}
```

In the **editing** return, add a `DietaryTagsSelect` as a new row spanning all 5 columns, after the existing 5 input/select cells and before the save/cancel `<div>`. Replace the entire editing `<div>`:

```tsx
if (editing) {
  return (
    <div className='grid grid-cols-[1fr_1fr_auto_auto_auto] items-center px-4 py-3 border-b last:border-b-0 gap-3'>
      <Input value={name} onChange={(e) => setName(e.target.value)} className='h-8 text-sm' disabled={isUpdating} />
      <Input value={description} onChange={(e) => setDescription(e.target.value)} className='h-8 text-sm' disabled={isUpdating} />
      <Input type='number' value={price} onChange={(e) => setPrice(e.target.value)} className='h-8 text-sm w-24' step='0.01' min='0' placeholder='0.00' disabled={isUpdating} />
      <Select value={type} onValueChange={(v) => setType(v as MealType)} disabled={isUpdating}>
        <SelectTrigger className='h-8 w-28 text-xs'>
          <SelectValue>{(v: string) => tEmp(`mealTypes.${v as MealType}`)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.values(MealType).map((mealType) => (
            <SelectItem key={mealType} value={mealType} label={tEmp(`mealTypes.${mealType}`)}>
              {tEmp(`mealTypes.${mealType}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className='flex gap-1'>
        <button onClick={handleSave} disabled={isUpdating} className='p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30'>
          <Check size={15} />
        </button>
        <button onClick={handleCancel} disabled={isUpdating} className='p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30'>
          <X size={15} />
        </button>
      </div>
      <div className='col-span-5'>
        <DietaryTagsSelect value={dietaryTags} onChange={setDietaryTags} />
      </div>
    </div>
  );
}
```

In the **read** return, update the name cell to show badges below the name:
```tsx
<div className='flex flex-col'>
  <span className='text-sm font-medium'>{meal.name}</span>
  {meal.dietaryTags && meal.dietaryTags.length > 0 && (
    <div className='flex flex-wrap gap-1 mt-1'>
      {meal.dietaryTags.map((tag) => (
        <DietaryTagBadge key={tag} tag={tag} />
      ))}
    </div>
  )}
</div>
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npm run build --workspace=apps/web`
Expected: Exits 0.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/suppliers/presentation/pages/in-house-supplier-detail.page.tsx
git commit -m "feat(web): add dietary tags to supplier detail create form and meal row edit/display"
```

---

## Verification Checklist

After all tasks, start the full stack with `npm run start:dev` and verify:

- [ ] Create a meal with dietary tags via the Meals tab form — tags persist and show as badges in the list
- [ ] Create a meal with dietary tags via the Create Meal dialog from the menu period builder — palette card shows badges
- [ ] Edit a meal's dietary tags inline in the Meals tab — saved tags reflect correctly
- [ ] Employee selection flow: meal cards show dietary tag badges for tagged meals
- [ ] Switch UI language to Serbian — tag labels change to Serbian (e.g. "Lenten" → "Posno")
- [ ] Create a meal with no dietary tags — no badges shown, no error
