import { IMealResponse } from '@food-up/shared';

interface DragOverlayCardProps {
  meal: IMealResponse;
}

export function DragOverlayCard({ meal }: DragOverlayCardProps) {
  return (
    <div className='px-3 py-2 rounded-md border bg-card text-sm font-medium shadow-lg rotate-2 cursor-grabbing opacity-90'>
      {meal.name}
    </div>
  );
}
