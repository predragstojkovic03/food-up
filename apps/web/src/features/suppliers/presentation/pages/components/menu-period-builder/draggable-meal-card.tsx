import { IMealResponse } from '@food-up/shared';
import { useDraggable } from '@dnd-kit/core';
import { DietaryTagBadge } from '@/components/dietary-tag-badge';

interface DraggableMealCardProps {
  meal: IMealResponse;
}

export function DraggableMealCard({ meal }: DraggableMealCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: meal.id,
    data: { meal },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        px-3 py-2 rounded-md border bg-card text-sm font-medium
        cursor-grab active:cursor-grabbing select-none
        hover:border-primary/50 hover:bg-accent transition-colors
        ${isDragging ? 'opacity-40' : ''}
      `}
    >
      <span>{meal.name}</span>
      {meal.dietaryTags && meal.dietaryTags.length > 0 && (
        <div className='flex flex-wrap gap-1 mt-1.5'>
          {meal.dietaryTags.map((tag) => (
            <DietaryTagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
