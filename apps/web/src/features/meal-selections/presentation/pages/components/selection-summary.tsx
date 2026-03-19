import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MealType } from '@food-up/shared';
import { CheckCircle2, Pencil } from 'lucide-react';
import { DaySelection, MenuItemOption } from '../types';

const TYPE_LABELS: Record<MealType, string> = {
  [MealType.Soup]: 'Soup',
  [MealType.Lunch]: 'Main',
  [MealType.Salad]: 'Salad',
  [MealType.Breakfast]: 'Breakfast',
  [MealType.Dinner]: 'Dinner',
  [MealType.Dessert]: 'Dessert',
};

const TYPE_ORDER: MealType[] = [
  MealType.Breakfast,
  MealType.Soup,
  MealType.Lunch,
  MealType.Dinner,
  MealType.Salad,
  MealType.Dessert,
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

interface SelectionSummaryProps {
  selections: DaySelection[];
  allItems: MenuItemOption[];
  onEditDay: (index: number) => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export function SelectionSummary({
  selections,
  allItems,
  onEditDay,
  onConfirm,
  isSubmitting,
}: SelectionSummaryProps) {
  const itemMap = new Map(allItems.map((i) => [i.id, i]));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-semibold text-lg">Review your selections</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Confirm to submit your meal choices.
        </p>
      </div>

      <div className="space-y-4">
        {selections.map((day, idx) => (
          <div key={day.date} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">{formatDate(day.date)}</p>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                onClick={() => onEditDay(idx)}
                aria-label="Edit this day"
              >
                <Pencil className="size-3.5" />
              </Button>
            </div>

            {day.skipped ? (
              <p className="text-xs text-muted-foreground italic">Skipped — no order</p>
            ) : (
              <div className="space-y-1.5">
                {TYPE_ORDER.filter((t) => day.choices[t]).map((type) => {
                  const item = itemMap.get(day.choices[type]!);
                  return (
                    <div key={type} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-xs text-muted-foreground w-16 shrink-0">
                        {TYPE_LABELS[type]}
                      </span>
                      <span className="flex-1 min-w-0 truncate">{item?.name ?? '—'}</span>
                    </div>
                  );
                })}
                {TYPE_ORDER.every((t) => !day.choices[t]) && (
                  <p className="text-xs text-muted-foreground italic">No meals selected</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Separator />

      <Button
        className="w-full"
        size="lg"
        onClick={onConfirm}
        disabled={isSubmitting}
      >
        <CheckCircle2 className="size-4 mr-2" />
        {isSubmitting ? 'Submitting…' : 'Confirm selections'}
      </Button>
    </div>
  );
}
