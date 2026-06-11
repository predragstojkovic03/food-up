# Meal Price Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose meal price in API responses, add price to the meal inline edit row, and auto-copy meal price onto menu items at creation time (no menu item price editing UI).

**Architecture:** Three coordinated changes — shared `IMealResponse` gains `price`, the backend `MealResponseDto` exposes it, the `MenuItemsService.create` copies `meal.price` instead of using the client-supplied price, and the `MealRow` edit component gains a price input. The frontend drag-and-drop code is untouched.

**Tech Stack:** NestJS 11, TypeORM, class-transformer, React 19, TanStack Query, Zod, Tailwind CSS v4

---

### Task 1: Expose price in shared IMealResponse and backend MealResponseDto

**Files:**
- Modify: `shared/src/interfaces/meal.ts`
- Modify: `apps/server/src/core/meals/presentation/rest/dto/meal-response.dto.ts`

- [ ] **Step 1: Add price to IMealResponse**

In `shared/src/interfaces/meal.ts`, update `IMealResponse` to add the `price` field:

```typescript
import { MealType } from '../enums/meal-type.enum';

export interface ICreateMeal {
  name: string;
  description?: string;
  type: MealType;
  price?: number;
  supplierId?: string;
}

export interface IUpdateMeal extends Partial<ICreateMeal> {}

export interface IMealResponse {
  id: string;
  name: string;
  description?: string;
  type: MealType;
  price?: number;
}
```

- [ ] **Step 2: Expose price in MealResponseDto**

In `apps/server/src/core/meals/presentation/rest/dto/meal-response.dto.ts`, add the `price` field following the existing pattern (no individual `@Expose()` — matches the other fields):

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { MealType } from '@food-up/shared';

@Expose()
export class MealResponseDto {
  @ApiProperty({ example: 'meal-uuid', description: 'Meal ID' })
  id: string;

  @ApiProperty({ example: 'Chicken Sandwich', description: 'Name of the meal' })
  name: string;

  @ApiProperty({
    example: 'Grilled chicken with lettuce',
    description: 'Description of the meal',
    required: false,
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    example: MealType.Lunch,
    enum: MealType,
    description: 'Meal type',
  })
  type: MealType;

  @ApiProperty({
    example: 450.0,
    description: 'Price of the meal in RSD',
    required: false,
    nullable: true,
  })
  price?: number;
}
```

- [ ] **Step 3: Build shared to verify no TypeScript errors**

```bash
npm run build --workspace=shared
```

Expected: exits 0, no type errors.

- [ ] **Step 4: Commit**

```bash
git add shared/src/interfaces/meal.ts apps/server/src/core/meals/presentation/rest/dto/meal-response.dto.ts
git commit -m "feat(meals): expose price field in meal response DTO and shared interface"
```

---

### Task 2: Copy meal price to menu item on creation (backend)

**Files:**
- Modify: `apps/server/src/core/menu-items/application/menu-items.service.ts`
- Test: `apps/server/src/core/menu-items/application/menu-items.service.spec.ts` (create if absent)

- [ ] **Step 1: Write failing tests**

Create or open `apps/server/src/core/menu-items/application/menu-items.service.spec.ts`. Add two tests covering price copy behavior. The suite needs mocks for all five dependencies injected into `MenuItemsService`.

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MealType } from '@food-up/shared';
import { Meal } from 'src/core/meals/domain/meal.entity';
import { MenuPeriod } from 'src/core/menu-periods/domain/menu-period.entity';
import { MealsService } from 'src/core/meals/application/meals.service';
import { MenuPeriodsService } from 'src/core/menu-periods/application/menu-periods.service';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import { MenuItemsQueryService } from './queries/menu-items-query.service';
import { I_MENU_ITEMS_REPOSITORY } from '../domain/menu-items.repository.interface';
import { MenuItemsService } from './menu-items.service';

describe('MenuItemsService.create — price copy', () => {
  let service: MenuItemsService;
  let repositoryMock: Record<string, jest.Mock>;
  let mealsServiceMock: Record<string, jest.Mock>;
  let menuPeriodsServiceMock: Record<string, jest.Mock>;

  beforeEach(async () => {
    repositoryMock = {
      findOneByCriteria: jest.fn().mockResolvedValue(null),
      insert: jest.fn().mockResolvedValue(undefined),
    };
    mealsServiceMock = { findOne: jest.fn() };
    menuPeriodsServiceMock = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemsService,
        { provide: I_MENU_ITEMS_REPOSITORY, useValue: repositoryMock },
        { provide: MenuItemsQueryService, useValue: {} },
        { provide: MealsService, useValue: mealsServiceMock },
        { provide: MenuPeriodsService, useValue: menuPeriodsServiceMock },
        { provide: MealSelectionWindowsService, useValue: {} },
      ],
    }).compile();

    service = module.get(MenuItemsService);
  });

  it('copies meal price onto the created menu item', async () => {
    const meal = Meal.reconstitute('meal-1', 'Pizza', undefined, MealType.Lunch, 'supplier-1', 450);
    const menuPeriod = { id: 'period-1', supplierId: 'supplier-1' } as MenuPeriod;
    mealsServiceMock.findOne.mockResolvedValue(meal);
    menuPeriodsServiceMock.findOne.mockResolvedValue(menuPeriod);

    const result = await service.create({
      menuPeriodId: 'period-1',
      day: '2026-06-11',
      mealId: 'meal-1',
    });

    expect(result.price).toBe(450);
  });

  it('sets menu item price to null when meal has no price', async () => {
    const meal = Meal.reconstitute('meal-2', 'Salad', undefined, MealType.Lunch, 'supplier-1', undefined);
    const menuPeriod = { id: 'period-1', supplierId: 'supplier-1' } as MenuPeriod;
    mealsServiceMock.findOne.mockResolvedValue(meal);
    menuPeriodsServiceMock.findOne.mockResolvedValue(menuPeriod);

    const result = await service.create({
      menuPeriodId: 'period-1',
      day: '2026-06-11',
      mealId: 'meal-2',
    });

    expect(result.price).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test --workspace=apps/server -- --testPathPattern="menu-items.service.spec"
```

Expected: both tests fail (`result.price` is `undefined` or `null` when it should be `450`, and/or the first test fails because `dto.price` is `undefined`).

- [ ] **Step 3: Implement the fix in MenuItemsService.create**

In `apps/server/src/core/menu-items/application/menu-items.service.ts`, change the `MenuItem.create` call inside `create()` (line 53) to use `meal.price` instead of `dto.price`:

```typescript
const menuItem = MenuItem.create(
  meal.price ?? null,
  dto.menuPeriodId,
  dto.day,
  meal.id,
);
```

The `dto.price` parameter remains in the method signature for backwards-compatibility with any direct service callers, but it is no longer used here.

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm run test --workspace=apps/server -- --testPathPattern="menu-items.service.spec"
```

Expected: both tests pass.

- [ ] **Step 5: Run the full test suite**

```bash
npm run test --workspace=apps/server
```

Expected: all tests pass, no regressions.

- [ ] **Step 6: Commit**

```bash
git add apps/server/src/core/menu-items/application/menu-items.service.ts apps/server/src/core/menu-items/application/menu-items.service.spec.ts
git commit -m "feat(menu-items): copy meal price to menu item on creation"
```

---

### Task 3: Add price to the meal inline edit row (frontend)

**Files:**
- Modify: `apps/web/src/features/suppliers/presentation/pages/in-house-supplier-detail.page.tsx`

There are four places to update in this file:

1. The `updateMeal` mutation type (line ~135) — add `price?: number`
2. The `MealRowProps` interface (line ~315) — add `price?: number` to `onUpdate`
3. The `MealRow` component body — add `price` state, update `handleSave`, `handleCancel`, and both grid layouts

- [ ] **Step 1: Update updateMeal mutation type**

Around line 134, replace the `mutationFn` payload type to include `price`:

```typescript
const updateMeal = useMutation({
  mutationFn: (payload: { id: string; name?: string; description?: string; type?: MealType; price?: number }) => {
    const { id, ...data } = payload;
    return mealService.update(id, data);
  },
  onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
});
```

- [ ] **Step 2: Update MealRowProps and MealRow state**

Around line 315, update `MealRowProps` and add `price` state inside `MealRow`:

```typescript
interface MealRowProps {
  meal: IMealResponse;
  isUpdating: boolean;
  isRemoving: boolean;
  onUpdate: (data: { name?: string; description?: string; type?: MealType; price?: number }) => void;
  onRemove: () => void;
}

function MealRow({ meal, isUpdating, isRemoving, onUpdate, onRemove }: MealRowProps) {
  const { t } = useTranslation('suppliers');
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(meal.name);
  const [description, setDescription] = useState(meal.description ?? '');
  const [type, setType] = useState<MealType>(meal.type);
  const [price, setPrice] = useState<string>(meal.price != null ? String(meal.price) : '');
```

- [ ] **Step 3: Update handleSave and handleCancel**

Replace the two handlers inside `MealRow`:

```typescript
function handleSave() {
  onUpdate({
    name,
    description: description || undefined,
    type,
    price: price !== '' ? Number(price) : undefined,
  });
  setEditing(false);
}

function handleCancel() {
  setName(meal.name);
  setDescription(meal.description ?? '');
  setType(meal.type);
  setPrice(meal.price != null ? String(meal.price) : '');
  setEditing(false);
}
```

- [ ] **Step 4: Update the edit-mode grid layout**

Replace the edit-mode `return` block. Change `grid-cols-[1fr_1fr_auto_auto]` to `grid-cols-[1fr_1fr_auto_auto_auto]` and insert the price input between the description input and the type select:

```tsx
if (editing) {
  return (
    <div className='grid grid-cols-[1fr_1fr_auto_auto_auto] items-center px-4 py-3 border-b last:border-b-0 gap-3'>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className='h-8 text-sm'
        disabled={isUpdating}
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className='h-8 text-sm'
        disabled={isUpdating}
      />
      <Input
        type='number'
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className='h-8 text-sm w-24'
        step='0.01'
        min='0'
        disabled={isUpdating}
      />
      <Select
        value={type}
        onValueChange={(v) => setType(v as MealType)}
        disabled={isUpdating}
      >
        <SelectTrigger className='h-8 w-28 text-xs'>
          <SelectValue>{(v: string) => MEAL_TYPE_LABELS[v as MealType] ?? v}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.values(MealType).map((t) => (
            <SelectItem key={t} value={t} label={MEAL_TYPE_LABELS[t]}>
              {MEAL_TYPE_LABELS[t]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className='flex gap-1'>
        <button
          onClick={handleSave}
          disabled={isUpdating}
          className='p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30'
        >
          <Check size={15} />
        </button>
        <button
          onClick={handleCancel}
          disabled={isUpdating}
          className='p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30'
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update the view-mode grid layout**

Replace the view-mode `return` block. Change `grid-cols-[1fr_1fr_auto_auto]` to `grid-cols-[1fr_1fr_auto_auto_auto]` and add the price display between the description span and the type badge:

```tsx
return (
  <div className='grid grid-cols-[1fr_1fr_auto_auto_auto] items-center px-4 py-3 border-b last:border-b-0 gap-3'>
    <span className='text-sm font-medium'>{meal.name}</span>
    <span className='text-sm text-muted-foreground truncate'>
      {meal.description ?? <span className='italic'>—</span>}
    </span>
    <span className='text-sm text-muted-foreground w-24 text-right'>
      {meal.price != null ? meal.price.toFixed(2) : <span className='italic'>—</span>}
    </span>
    <span className='text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground'>
      {MEAL_TYPE_LABELS[meal.type]}
    </span>
    <div className='flex gap-1'>
      <button
        onClick={() => setEditing(true)}
        disabled={isRemoving}
        className='p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30'
      >
        <Pencil size={15} />
      </button>
      <AlertDialog>
        <AlertDialogTrigger
          disabled={isRemoving}
          className='p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-30'
        >
          <Trash2 size={15} />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('detail.meals.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              <span className='font-medium'>{meal.name}</span>{' '}
              {t('detail.meals.deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel', { ns: 'common' })}</AlertDialogCancel>
            <AlertDialogAction onClick={onRemove}>{t('actions.delete', { ns: 'common' })}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
);
```

- [ ] **Step 6: TypeScript check**

```bash
npm run build --workspace=apps/web
```

Expected: exits 0, no type errors.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/suppliers/presentation/pages/in-house-supplier-detail.page.tsx
git commit -m "feat(suppliers): add price field to meal inline edit row"
```
