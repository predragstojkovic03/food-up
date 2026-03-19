import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { IMyMealSelectionResponse, IRelevantMealSelectionWindowResponse, IWindowMenuItemResponse, MealType } from '@food-up/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const TYPE_ORDER: MealType[] = [
  MealType.Breakfast,
  MealType.Soup,
  MealType.Lunch,
  MealType.Dinner,
  MealType.Salad,
  MealType.Dessert,
];

const TYPE_LABELS: Record<MealType, string> = {
  [MealType.Breakfast]: 'Breakfast',
  [MealType.Soup]: 'Soup',
  [MealType.Lunch]: 'Main',
  [MealType.Dinner]: 'Dinner',
  [MealType.Salad]: 'Salad',
  [MealType.Dessert]: 'Dessert',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

interface CreateChangeRequestSheetProps {
  window: IRelevantMealSelectionWindowResponse;
  selections: IMyMealSelectionResponse[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChangeRequestSheet({
  window,
  selections,
  open,
  onOpenChange,
}: CreateChangeRequestSheetProps) {
  const { mealSelectionWindowService, changeRequestService } = useServices();
  const queryClient = useQueryClient();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const futureDates = window.targetDates.filter((d) => d > today);

  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery({
    queryKey: ['meal-selection-windows', 'menu-items', window.id],
    queryFn: () => mealSelectionWindowService.getMenuItems(window.id),
    enabled: open,
  });

  const dayMenuItems: IWindowMenuItemResponse[] = selectedDay
    ? menuItems.filter((m) => m.day === selectedDay)
    : [];

  const existingSelection = selectedDay
    ? selections.find((s) => s.date === selectedDay && s.menuItemId !== null) ?? null
    : null;

  function handleDaySelect(date: string) {
    setSelectedDay(date);
    setSelectedMenuItemId(null);
  }

  function handleClose() {
    setSelectedDay(null);
    setSelectedMenuItemId(null);
    onOpenChange(false);
  }

  async function handleSubmit() {
    if (!selectedMenuItemId || !selectedDay) return;
    setIsSubmitting(true);
    try {
      await changeRequestService.create({
        mealSelectionWindowId: window.id,
        mealSelectionId: existingSelection?.id,
        newMenuItemId: selectedMenuItemId,
        newQuantity: 1,
      });
      queryClient.invalidateQueries({ queryKey: ['change-requests', 'my'] });
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(_, open) => { if (!open) handleClose(); }}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto rounded-t-xl px-0">
        <SheetHeader className="px-4">
          <SheetTitle>Request a change</SheetTitle>
        </SheetHeader>

        <div className="px-4 space-y-5 pb-2">
          {/* Step 1 — pick a day */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Select a day</p>
            {futureDates.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No future days available for change requests.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {futureDates.map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDaySelect(date)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                      selectedDay === date
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'border-border bg-card hover:bg-muted'
                    }`}
                  >
                    {formatDate(date)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2 — pick a meal */}
          {selectedDay && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Select new meal</p>

              {existingSelection?.meal && (
                <p className="text-xs text-muted-foreground">
                  Currently: <span className="font-medium text-foreground">{existingSelection.meal.name}</span>
                </p>
              )}

              {menuItemsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                  <Skeleton className="h-14 w-full rounded-lg" />
                </div>
              ) : dayMenuItems.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No meals available for this day.</p>
              ) : (
                <div className="space-y-3">
                  {TYPE_ORDER.filter((t) => dayMenuItems.some((m) => m.meal.type === t)).map((type) => (
                    <div key={type} className="space-y-1.5">
                      <p className="text-xs text-muted-foreground font-medium">{TYPE_LABELS[type]}</p>
                      {dayMenuItems
                        .filter((m) => m.meal.type === type)
                        .map((item) => {
                          const isSelected = selectedMenuItemId === item.id;
                          const isCurrent = existingSelection?.menuItemId === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setSelectedMenuItemId(item.id)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                                isSelected
                                  ? 'border-primary bg-primary/5 font-medium'
                                  : 'border-border bg-card hover:bg-muted'
                              }`}
                            >
                              <span>{item.meal.name}</span>
                              {isCurrent && (
                                <span className="ml-2 text-xs text-muted-foreground">(current)</span>
                              )}
                              {item.price != null && (
                                <span className="ml-auto text-xs text-muted-foreground float-right">
                                  {item.price.toFixed(2)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="px-4">
          <Button
            className="w-full"
            disabled={!selectedMenuItemId || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
