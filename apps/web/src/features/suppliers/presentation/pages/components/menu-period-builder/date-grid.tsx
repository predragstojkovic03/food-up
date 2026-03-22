import { IMealResponse, IMenuItemResponse } from '@food-up/shared';
import { DateDropZone } from './date-drop-zone';

interface DateGridProps {
  dates: string[];
  itemsByDate: Record<string, IMenuItemResponse[]>;
  mealById: Record<string, IMealResponse>;
  activeMealId?: string;
  removingItemId?: string;
  onRemove: (itemId: string) => void;
}

export function DateGrid({
  dates,
  itemsByDate,
  mealById,
  activeMealId,
  removingItemId,
  onRemove,
}: DateGridProps) {
  return (
    <div className='flex-1 overflow-x-auto'>
      <div className='flex gap-3 pb-2' style={{ minWidth: 'max-content' }}>
        {dates.map((dateStr) => (
          <DateDropZone
            key={dateStr}
            dateStr={dateStr}
            items={itemsByDate[dateStr] ?? []}
            mealById={mealById}
            activeMealId={activeMealId}
            removingItemId={removingItemId}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
