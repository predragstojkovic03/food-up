import { IMealResponse } from '@food-up/shared';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableMealCardProps {
  meal: IMealResponse;
}

export function DraggableMealCard({ meal }: DraggableMealCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: meal.id,
    data: { meal },
  });

  const style = { transform: CSS.Transform.toString(transform) };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        px-3 py-2 rounded-md border bg-card text-sm font-medium
        cursor-grab active:cursor-grabbing select-none
        hover:border-primary/50 hover:bg-accent transition-colors
        ${isDragging ? 'opacity-40' : ''}
      `}
    >
      {meal.name}
    </div>
  );
}
