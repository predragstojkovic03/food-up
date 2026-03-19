import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MealType } from '@food-up/shared';
import { Dices, SkipForward } from 'lucide-react';
import { MenuItemOption, DaySelection } from '../types';
import { MealTypeGroup } from './meal-type-group';

interface DayStepProps {
  date: string;
  itemsByType: Partial<Record<MealType, MenuItemOption[]>>;
  selection: DaySelection;
  hasRemainingDays: boolean;
  onChoose: (type: MealType, itemId: string) => void;
  onSkipDay: () => void;
  onRandomizeDay: () => void;
  onRandomizeRemaining: () => void;
}

const TYPE_ORDER: MealType[] = [
  MealType.Breakfast,
  MealType.Soup,
  MealType.Lunch,
  MealType.Dinner,
  MealType.Salad,
  MealType.Dessert,
];

export function DayStep({
  itemsByType,
  selection,
  hasRemainingDays,
  onChoose,
  onSkipDay,
  onRandomizeDay,
  onRandomizeRemaining,
}: DayStepProps) {
  const availableTypes = TYPE_ORDER.filter((t) => (itemsByType[t]?.length ?? 0) > 0);

  return (
    <div className="space-y-5">
      {selection.skipped && (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/40 px-4 py-3 text-sm text-muted-foreground text-center">
          This day is skipped — no meals will be ordered
        </div>
      )}

      {availableTypes.map((type, i) => (
        <div key={type}>
          <MealTypeGroup
            type={type}
            items={itemsByType[type]!}
            selectedId={selection.choices[type]}
            onSelect={(id) => onChoose(type, id)}
          />
          {i < availableTypes.length - 1 && <Separator className="mt-4" />}
        </div>
      ))}

      <div className="flex flex-col gap-2 pt-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onRandomizeDay}
          >
            <Dices className="size-4 mr-1.5" />
            Randomize day
          </Button>
          {hasRemainingDays && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onRandomizeRemaining}
            >
              <Dices className="size-4 mr-1.5" />
              Randomize rest
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={`w-full text-muted-foreground hover:text-foreground ${selection.skipped ? 'text-destructive hover:text-destructive' : ''}`}
          onClick={onSkipDay}
        >
          <SkipForward className="size-4 mr-1.5" />
          {selection.skipped ? 'Undo skip' : 'Skip this day'}
        </Button>
      </div>
    </div>
  );
}
