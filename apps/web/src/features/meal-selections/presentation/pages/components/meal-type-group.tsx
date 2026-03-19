import { MealType } from '@food-up/shared';
import { MenuItemOption } from '../types';
import { MealCard } from './meal-card';

const TYPE_LABELS: Record<MealType, string> = {
  [MealType.Soup]: 'Soup',
  [MealType.Lunch]: 'Main',
  [MealType.Salad]: 'Salad',
  [MealType.Breakfast]: 'Breakfast',
  [MealType.Dinner]: 'Dinner',
  [MealType.Dessert]: 'Dessert',
};

interface MealTypeGroupProps {
  type: MealType;
  items: MenuItemOption[];
  selectedId?: string;
  onSelect: (itemId: string) => void;
}

export function MealTypeGroup({ type, items, selectedId, onSelect }: MealTypeGroupProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
        {TYPE_LABELS[type]}
      </h3>
      <div className="space-y-2">
        {items.map((item) => (
          <MealCard
            key={item.id}
            item={item}
            selected={selectedId === item.id}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </div>
    </div>
  );
}
