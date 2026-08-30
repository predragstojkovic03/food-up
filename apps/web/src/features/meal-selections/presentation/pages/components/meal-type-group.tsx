import { MealType } from '@food-up/shared';
import { useTranslation } from 'react-i18next';
import { MenuItemOption } from '../types';
import { MealCard } from './meal-card';

interface MealTypeGroupProps {
  type: MealType;
  items: MenuItemOption[];
  selectedId?: string;
  onSelect: (itemId: string) => void;
}

export function MealTypeGroup({ type, items, selectedId, onSelect }: MealTypeGroupProps) {
  const { t } = useTranslation('employees');
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
        {t(`mealTypes.${type}`)}
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
