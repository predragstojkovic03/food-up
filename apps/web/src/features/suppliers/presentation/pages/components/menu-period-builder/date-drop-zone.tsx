import { IMealResponse, IMenuItemResponse } from '@food-up/shared';
import { useDroppable } from '@dnd-kit/core';
import { AssignedMealChip } from './assigned-meal-chip';

interface DateDropZoneProps {
  dateStr: string;
  items: IMenuItemResponse[];
  mealById: Record<string, IMealResponse>;
  activeMealId?: string;
  removingItemId?: string;
  onRemove: (itemId: string) => void;
}

function formatDateLabel(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function DateDropZone({
  dateStr,
  items,
  mealById,
  activeMealId,
  removingItemId,
  onRemove,
}: DateDropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });

  const isDuplicate =
    activeMealId !== undefined && items.some((item) => item.mealId === activeMealId);

  let borderClass = 'border-border';
  let bgClass = 'bg-card';

  if (isOver) {
    if (isDuplicate) {
      borderClass = 'border-destructive';
      bgClass = 'bg-destructive/5';
    } else {
      borderClass = 'border-primary';
      bgClass = 'bg-primary/5';
    }
  }

  return (
    <div className='flex flex-col min-w-[160px] shrink-0'>
      <p className='text-xs font-medium text-muted-foreground mb-2 truncate'>
        {formatDateLabel(dateStr)}
      </p>
      <div
        ref={setNodeRef}
        className={`
          flex-1 min-h-[120px] rounded-md border-2 border-dashed p-2 flex flex-col gap-1.5
          transition-colors
          ${borderClass} ${bgClass}
        `}
      >
        {items.map((item) => {
          const meal = mealById[item.mealId];
          if (!meal) return null;
          return (
            <AssignedMealChip
              key={item.id}
              meal={meal}
              onRemove={() => onRemove(item.id)}
              isRemoving={removingItemId === item.id}
            />
          );
        })}
        {items.length === 0 && !isOver && (
          <p className='text-xs text-muted-foreground/50 text-center my-auto'>
            Drop here
          </p>
        )}
        {isOver && isDuplicate && (
          <p className='text-xs text-destructive text-center my-auto'>
            Already assigned
          </p>
        )}
      </div>
    </div>
  );
}
