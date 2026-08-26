import { IMealResponse, MealType } from '@food-up/shared';
import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
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

interface MealPaletteProps {
  meals: IMealResponse[];
  supplierId: string;
}

export function MealPalette({ meals, supplierId }: MealPaletteProps) {
  const { t } = useTranslation('suppliers');
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
          {t('menuPeriodBuilder.title')}
        </p>
        <Button
          variant='ghost'
          size='icon'
          className='h-5 w-5'
          onClick={() => setDialogOpen(true)}
          title={t('menuPeriodBuilder.addMeal')}
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
          placeholder={t('menuPeriodBuilder.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className='overflow-y-auto max-h-[480px] flex flex-col gap-4'>
        {!hasAny && query.trim() && (
          <p className='text-xs text-muted-foreground'>{t('menuPeriodBuilder.noMatch')}</p>
        )}
        {!hasAny && !query.trim() && (
          <p className='text-xs text-muted-foreground'>{t('menuPeriodBuilder.noMeals')}</p>
        )}
        {TYPE_ORDER.map((type) => {
          const group = grouped[type];
          if (!group?.length) return null;
          return (
            <div key={type} className='space-y-1.5'>
              <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                {t(`mealTypes.${type}`, { ns: 'employees' })}
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
