import { IMealResponse } from '@food-up/shared';
import { X } from 'lucide-react';

interface AssignedMealChipProps {
  meal: IMealResponse;
  onRemove: () => void;
  isRemoving: boolean;
}

export function AssignedMealChip({ meal, onRemove, isRemoving }: AssignedMealChipProps) {
  return (
    <div className='flex items-center gap-1.5 px-2 py-1 rounded bg-accent text-xs font-medium group'>
      <span className='flex-1 truncate'>{meal.name}</span>
      <button
        type='button'
        onClick={onRemove}
        disabled={isRemoving}
        className='shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40'
        aria-label={`Remove ${meal.name}`}
      >
        <X size={12} />
      </button>
    </div>
  );
}
