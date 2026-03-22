import { IMealResponse, MealType } from '@food-up/shared';
import { DraggableMealCard } from './draggable-meal-card';

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
}

export function MealPalette({ meals }: MealPaletteProps) {
  const grouped: Partial<Record<MealType, IMealResponse[]>> = {};
  for (const meal of meals) {
    if (!grouped[meal.type]) grouped[meal.type] = [];
    grouped[meal.type]!.push(meal);
  }

  const hasAny = TYPE_ORDER.some((t) => (grouped[t]?.length ?? 0) > 0);

  return (
    <div className='w-52 shrink-0 flex flex-col gap-4 overflow-y-auto'>
      <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
        Meals
      </p>
      {!hasAny && (
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
  );
}
