import { IMealResponse, IMenuItemResponse, IMenuPeriodResponse } from '@food-up/shared';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { DragOverlayCard } from './drag-overlay-card';
import { DateGrid } from './date-grid';
import { MealPalette } from './meal-palette';
import { useMenuPeriodBuilder } from './use-menu-period-builder';

interface MenuPeriodBuilderProps {
  period: IMenuPeriodResponse;
  meals: IMealResponse[];
  items: IMenuItemResponse[];
  removingItemId?: string;
  onCreate: (data: { menuPeriodId: string; day: string; mealId: string }) => void;
  onRemove: (itemId: string) => void;
}

export function MenuPeriodBuilder({
  period,
  meals,
  items,
  removingItemId,
  onCreate,
  onRemove,
}: MenuPeriodBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const { dates, mealById, itemsByDate, activeMeal, onDragStart, onDragEnd, handleRemove } =
    useMenuPeriodBuilder({ period, meals, items, onCreate, onRemove });

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className='flex gap-6 p-4 items-start'>
        <MealPalette meals={meals} />
        <DateGrid
          dates={dates}
          itemsByDate={itemsByDate}
          mealById={mealById}
          activeMealId={activeMeal?.id}
          removingItemId={removingItemId}
          onRemove={handleRemove}
        />
      </div>
      <DragOverlay>
        {activeMeal && <DragOverlayCard meal={activeMeal} />}
      </DragOverlay>
    </DndContext>
  );
}
