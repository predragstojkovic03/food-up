import { IMealResponse, IMenuItemResponse, IMenuPeriodResponse } from '@food-up/shared';
import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useMemo, useState } from 'react';

export interface UseMenuPeriodBuilderProps {
  period: IMenuPeriodResponse;
  meals: IMealResponse[];
  items: IMenuItemResponse[];
  onCreate: (data: { menuPeriodId: string; day: string; mealId: string }) => void;
  onRemove: (itemId: string) => void;
}

function expandDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function useMenuPeriodBuilder({
  period,
  meals,
  items,
  onCreate,
  onRemove,
}: UseMenuPeriodBuilderProps) {
  const [activeMeal, setActiveMeal] = useState<IMealResponse | null>(null);

  const dates = useMemo(
    () => expandDateRange(period.startDate, period.endDate),
    [period.startDate, period.endDate],
  );

  const mealById = useMemo(
    () => Object.fromEntries(meals.map((m) => [m.id, m])),
    [meals],
  );

  const itemsByDate = useMemo(() => {
    const result: Record<string, IMenuItemResponse[]> = {};
    for (const date of dates) {
      result[date] = [];
    }
    for (const item of items) {
      if (result[item.day]) {
        result[item.day].push(item);
      }
    }
    return result;
  }, [dates, items]);

  function onDragStart(event: DragStartEvent) {
    const meal = event.active.data.current?.meal as IMealResponse | undefined;
    setActiveMeal(meal ?? null);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveMeal(null);

    const draggedMeal = event.active.data.current?.meal as IMealResponse | undefined;
    const targetDate = event.over?.id as string | undefined;
    if (!targetDate || !draggedMeal) return;

    const existingItems = itemsByDate[targetDate] ?? [];
    const alreadyAssigned = existingItems.some((item) => item.mealId === draggedMeal.id);
    if (alreadyAssigned) return;

    onCreate({ menuPeriodId: period.id, day: targetDate, mealId: draggedMeal.id });
  }

  function isDuplicateMeal(dateStr: string, mealId: string): boolean {
    return (itemsByDate[dateStr] ?? []).some((item) => item.mealId === mealId);
  }

  return {
    dates,
    mealById,
    itemsByDate,
    activeMeal,
    onDragStart,
    onDragEnd,
    handleRemove: onRemove,
    isDuplicateMeal,
  };
}
