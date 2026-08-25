# Meal Palette UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add scrolling + fuzzy search to the meal palette, and allow creating a new meal inline via dialog without leaving the menu period builder.

**Architecture:** Three sequential changes — install Fuse.js, create a `CreateMealDialog` component that owns its own mutation, then update `MealPalette` to add the scroll container, search input, and dialog trigger. `MenuPeriodBuilder` threads `period.supplierId` down to `MealPalette`. No changes needed outside `menu-period-builder/`.

**Tech Stack:** React 19, TanStack Query v5, React Hook Form v7, Zod v4, Fuse.js, shadcn/ui (Dialog, Form, Input, Select, Button), Base UI, Tailwind CSS v4, lucide-react

**Spec:** `docs/superpowers/specs/2026-08-15-meal-palette-improvements-design.md`

## Global Constraints

- No `any` — use proper types or `unknown` with narrowing
- Props interfaces named `[ComponentName]Props`
- Use shadcn components (`Dialog`, `Form`, `Input`, `Select`, `Button`) — do not build custom versions
- Use Tailwind utility classes — no inline `style={}` props
- Use `useServices()` from `@/shared/infrastructure/di/service.context` to access services
- Dialog and Select both use `@base-ui/react` under the hood — follow existing usage patterns in the codebase
- `SelectValue` accepts a render-function as children: `{(v: string) => LABEL[v] ?? v}`
- Meals query key: `['meals', 'supplier', supplierId]`
- Files live in `apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/`

---

### Task 1: Install fuse.js

**Files:**
- Modify: `apps/web/package.json`

**Interfaces:**
- Produces: `fuse.js` package available for import as `import Fuse from 'fuse.js'` in `apps/web`

- [ ] **Step 1: Install fuse.js in the web workspace**

```bash
npm install fuse.js --workspace=apps/web
```

- [ ] **Step 2: Verify it was added to `apps/web/package.json`**

Check that `"fuse.js"` appears under `"dependencies"` in `apps/web/package.json`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json package-lock.json
git commit -m "feat(web): install fuse.js for fuzzy meal search"
```

---

### Task 2: Create CreateMealDialog component

**Files:**
- Create: `apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/create-meal-dialog.tsx`

**Interfaces:**
- Consumes: `useServices()` → `mealService.create`, `useQueryClient()`, shadcn `Dialog`/`Form`/`Input`/`Select`/`Button`, `MealType` enum from `@food-up/shared`
- Produces: `CreateMealDialog` component with props:
  ```ts
  interface CreateMealDialogProps {
    supplierId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
  }
  ```

- [ ] **Step 1: Create the file with full implementation**

Create `apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/create-meal-dialog.tsx`:

```tsx
import { MealType } from '@food-up/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServices } from '@/shared/infrastructure/di/service.context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  [MealType.Breakfast]: 'Breakfast',
  [MealType.Bread]: 'Bread',
  [MealType.Lunch]: 'Lunch',
  [MealType.Dinner]: 'Dinner',
  [MealType.Soup]: 'Soup',
  [MealType.Salad]: 'Salad',
  [MealType.Dessert]: 'Dessert',
};

const createMealSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(MealType),
  description: z.string().optional(),
  price: z.string().optional(),
});
type FormValues = z.infer<typeof createMealSchema>;

interface CreateMealDialogProps {
  supplierId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateMealDialog({
  supplierId,
  open,
  onOpenChange,
  onSuccess,
}: CreateMealDialogProps) {
  const { mealService } = useServices();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(createMealSchema),
    defaultValues: { name: '', type: MealType.Lunch, description: '', price: '' },
  });

  const createMeal = useMutation({
    mutationFn: mealService.create.bind(mealService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', 'supplier', supplierId] });
    },
  });

  function handleSubmit(values: FormValues) {
    createMeal.mutate(
      {
        name: values.name,
        type: values.type,
        description: values.description || undefined,
        price: values.price ? Number(values.price) : undefined,
        supplierId,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Add Meal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='grid grid-cols-2 gap-3'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. Chicken Soup' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {(v: string) => MEAL_TYPE_LABELS[v as MealType] ?? v}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(MealType).map((type) => (
                        <SelectItem key={type} value={type} label={MEAL_TYPE_LABELS[type]}>
                          {MEAL_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='col-span-2'>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder='Optional description' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type='number' step='0.01' min='0' placeholder='0.00' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='col-span-2 flex items-center justify-end gap-2 pt-1'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={createMeal.isPending}>
                {createMeal.isPending ? 'Creating…' : 'Create Meal'}
              </Button>
            </div>
            {createMeal.isError && (
              <p className='col-span-2 text-xs text-destructive'>
                Failed to create meal. Please try again.
              </p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in `create-meal-dialog.tsx`.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/create-meal-dialog.tsx
git commit -m "feat(web): add CreateMealDialog for inline meal creation in menu period builder"
```

---

### Task 3: Update MealPalette and MenuPeriodBuilder

**Files:**
- Modify: `apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/meal-palette.tsx`
- Modify: `apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/menu-period-builder.tsx`

**Interfaces:**
- Consumes: `CreateMealDialog` from `./create-meal-dialog`, `Fuse` from `fuse.js`, `Input` from `@/components/ui/input`, `Button` from `@/components/ui/button`, `Search` and `Plus` icons from `lucide-react`
- Produces: `MealPalette` with updated props:
  ```ts
  interface MealPaletteProps {
    meals: IMealResponse[];
    supplierId: string;
  }
  ```

- [ ] **Step 1: Replace `meal-palette.tsx` with the updated version**

Full file content for `apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/meal-palette.tsx`:

```tsx
import { IMealResponse, MealType } from '@food-up/shared';
import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DraggableMealCard } from './draggable-meal-card';
import { CreateMealDialog } from './create-meal-dialog';

const TYPE_ORDER: MealType[] = [
  MealType.Breakfast,
  MealType.Bread,
  MealType.Soup,
  MealType.Lunch,
  MealType.Dinner,
  MealType.Salad,
  MealType.Dessert,
];

const TYPE_LABELS: Record<MealType, string> = {
  [MealType.Breakfast]: 'Breakfast',
  [MealType.Bread]: 'Bread',
  [MealType.Soup]: 'Soup',
  [MealType.Lunch]: 'Main',
  [MealType.Dinner]: 'Dinner',
  [MealType.Salad]: 'Salad',
  [MealType.Dessert]: 'Dessert',
};

interface MealPaletteProps {
  meals: IMealResponse[];
  supplierId: string;
}

export function MealPalette({ meals, supplierId }: MealPaletteProps) {
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fuse = useMemo(
    () =>
      new Fuse(meals, {
        keys: ['name'],
        threshold: 0.35,
        ignoreLocation: true,
        distance: 100,
      }),
    [meals],
  );

  const filtered = query.trim() ? fuse.search(query).map((r) => r.item) : meals;

  const grouped: Partial<Record<MealType, IMealResponse[]>> = {};
  for (const meal of filtered) {
    if (!grouped[meal.type]) grouped[meal.type] = [];
    grouped[meal.type]!.push(meal);
  }

  const hasAny = TYPE_ORDER.some((t) => (grouped[t]?.length ?? 0) > 0);

  return (
    <div className='w-52 shrink-0 flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          Meals
        </p>
        <Button
          variant='ghost'
          size='icon'
          className='h-5 w-5'
          onClick={() => setDialogOpen(true)}
          title='Add meal'
        >
          <Plus size={14} />
        </Button>
      </div>

      <div className='relative'>
        <Search
          size={12}
          className='absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none'
        />
        <Input
          className='pl-7 h-7 text-xs'
          placeholder='Search meals…'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className='overflow-y-auto max-h-[480px] flex flex-col gap-4'>
        {!hasAny && query.trim() && (
          <p className='text-xs text-muted-foreground'>No meals match your search.</p>
        )}
        {!hasAny && !query.trim() && (
          <p className='text-xs text-muted-foreground'>No meals available.</p>
        )}
        {TYPE_ORDER.map((type) => {
          const group = grouped[type];
          if (!group?.length) return null;
          return (
            <div key={type} className='space-y-1.5'>
              <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                {TYPE_LABELS[type]}
              </p>
              {group.map((meal) => (
                <DraggableMealCard key={meal.id} meal={meal} />
              ))}
            </div>
          );
        })}
      </div>

      <CreateMealDialog
        supplierId={supplierId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => setQuery('')}
      />
    </div>
  );
}
```

- [ ] **Step 2: Update `MenuPeriodBuilder` to pass `supplierId` to `MealPalette`**

In `menu-period-builder.tsx`, change the `<MealPalette>` line from:

```tsx
<MealPalette meals={meals} />
```

to:

```tsx
<MealPalette meals={meals} supplierId={period.supplierId} />
```

`period` is already a prop of `MenuPeriodBuilder` (`period: IMenuPeriodResponse`) and `IMenuPeriodResponse` already has `supplierId: string` — no other changes needed in this file.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 4: Verify in the browser**

Start the dev server if not already running:

```bash
npm run start:dev
```

Then open the app and navigate to an in-house supplier detail page → Menu Periods tab → expand a menu period.

Check:
- The meal palette sidebar is capped at ~480px height and shows its own scrollbar when there are many meals.
- The page does not scroll when hovering over or scrolling within the palette.
- A search input is visible below the "Meals" header.
- Typing a meal name filters the list (case-insensitive, typo-tolerant: e.g. "chikn" should surface "Chicken" meals).
- Clearing the search restores the full grouped list.
- Typing something with no matches shows "No meals match your search."
- The "+" button (top-right of the palette header) opens a dialog with 4 fields: Name, Type, Description, Price.
- Submitting the dialog with only Name + Type (required fields) creates the meal successfully.
- After creation, the dialog closes, the search input is cleared, and the new meal appears in the palette.
- Submitting without a name shows a validation error "Name is required".
- The Cancel button and the × button both close the dialog without creating anything.
- Dragging meals onto date cells still works normally.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/meal-palette.tsx \
        apps/web/src/features/suppliers/presentation/pages/components/menu-period-builder/menu-period-builder.tsx
git commit -m "feat(web): add scroll, fuzzy search, and inline meal creation to meal palette"
```
