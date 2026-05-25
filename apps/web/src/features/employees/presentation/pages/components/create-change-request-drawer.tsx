import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { formatRSD } from '@/lib/utils';
import { IMyMealSelectionResponse, IRelevantMealSelectionWindowResponse, MealType } from '@food-up/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type PendingChange = { newMenuItemId: string | null; clearSelection: boolean };

const TYPE_ORDER: MealType[] = [
  MealType.Breakfast,
  MealType.Soup,
  MealType.Lunch,
  MealType.Dinner,
  MealType.Salad,
  MealType.Dessert,
];


function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { weekday: 'long', month: 'short', day: 'numeric' });
}

interface CreateChangeRequestDrawerProps {
  window: IRelevantMealSelectionWindowResponse;
  selections: IMyMealSelectionResponse[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChangeRequestDrawer({
  window,
  selections,
  open,
  onOpenChange,
}: CreateChangeRequestDrawerProps) {
  const { t, i18n } = useTranslation('employees');
  const { mealSelectionWindowService, changeRequestService } = useServices();
  const queryClient = useQueryClient();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, PendingChange>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const futureDates = window.targetDates.filter((d) => d > today);

  const { data: menuItems = [], isLoading: menuItemsLoading } = useQuery({
    queryKey: ['meal-selection-windows', 'menu-items', window.id],
    queryFn: () => mealSelectionWindowService.getMenuItems(window.id),
    enabled: open,
  });

  const daySelections: IMyMealSelectionResponse[] = selectedDay
    ? selections.filter((s) => s.date === selectedDay && s.menuItemId !== null)
    : [];

  const dayMenuItems = selectedDay ? menuItems.filter((m) => m.day === selectedDay) : [];

  function handleDaySelect(date: string) {
    setSelectedDay(date);
    setPendingChanges({});
    setSubmitError(null);
  }

  function handleClose() {
    setSelectedDay(null);
    setPendingChanges({});
    setSubmitError(null);
    onOpenChange(false);
  }

  function handleToggleItem(mealSelectionId: string, menuItemId: string) {
    setPendingChanges((prev) => {
      if (prev[mealSelectionId]?.newMenuItemId === menuItemId) {
        const next = { ...prev };
        delete next[mealSelectionId];
        return next;
      }
      return { ...prev, [mealSelectionId]: { newMenuItemId: menuItemId, clearSelection: false } };
    });
  }

  function handleRemove(mealSelectionId: string) {
    setPendingChanges((prev) => {
      if (prev[mealSelectionId]?.clearSelection) {
        const next = { ...prev };
        delete next[mealSelectionId];
        return next;
      }
      return { ...prev, [mealSelectionId]: { newMenuItemId: null, clearSelection: true } };
    });
  }

  async function handleSubmit() {
    if (Object.keys(pendingChanges).length === 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      for (const [mealSelectionId, change] of Object.entries(pendingChanges)) {
        await changeRequestService.create({
          mealSelectionWindowId: window.id,
          mealSelectionId,
          newMenuItemId: change.newMenuItemId ?? undefined,
          clearSelection: change.clearSelection,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['change-requests', 'my'] });
      handleClose();
    } catch {
      setSubmitError(t('changeRequest.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const pendingCount = Object.keys(pendingChanges).length;

  return (
    <Drawer open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <DrawerContent className="max-h-[85dvh] px-0">
        <div className="overflow-y-auto flex flex-col flex-1">
          <DrawerHeader className="px-4">
            <DrawerTitle>{t('changeRequest.title')}</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 space-y-5 pb-2">
            {/* Day picker */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('changeRequest.selectDay')}
              </p>
              {futureDates.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{t('changeRequest.noDaysAvailable')}</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {futureDates.map((date) => (
                    <button
                      type="button"
                      key={date}
                      onClick={() => handleDaySelect(date)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                        selectedDay === date
                          ? 'border-primary bg-primary/5 text-primary font-medium'
                          : 'border-border bg-card hover:bg-muted'
                      }`}
                    >
                      {formatDate(date, i18n.language)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Per-meal-type groups */}
            {selectedDay && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('changeRequest.selectChanges')}
                </p>

                {menuItemsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-lg" />
                  </div>
                ) : daySelections.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">{t('changeRequest.noSelectionsForDay')}</p>
                ) : (
                  <div className="space-y-4">
                    {TYPE_ORDER
                      .filter((type) => daySelections.some((s) => s.meal?.type === type))
                      .map((type) => {
                        const sel = daySelections.find((s) => s.meal?.type === type)!;
                        const alternatives = dayMenuItems.filter(
                          (m) => m.meal.type === type && m.id !== sel.menuItemId,
                        );
                        const pending = pendingChanges[sel.id];

                        return (
                          <div key={type} className="space-y-1.5">
                            <p className="text-xs text-muted-foreground font-medium">{t(`mealTypes.${type}`)}</p>

                            {/* Current selection — non-interactive */}
                            <div className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted text-sm flex justify-between items-center opacity-60">
                              <span className="text-muted-foreground">{sel.meal?.name}</span>
                              <span className="text-xs text-muted-foreground">{t('changeRequest.currentBadge')}</span>
                            </div>

                            {/* Alternatives */}
                            {alternatives.map((item) => {
                              const isSelected = pending?.newMenuItemId === item.id;
                              return (
                                <button
                                  type="button"
                                  key={item.id}
                                  onClick={() => handleToggleItem(sel.id, item.id)}
                                  className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors flex justify-between items-center ${
                                    isSelected
                                      ? 'border-primary bg-primary/5 font-medium'
                                      : 'border-border bg-card hover:bg-muted'
                                  }`}
                                >
                                  <span>{item.meal.name}</span>
                                  {item.price != null && (
                                    <span className="ml-auto text-xs text-muted-foreground">
                                      {formatRSD(item.price)}
                                    </span>
                                  )}
                                </button>
                              );
                            })}

                            {/* Remove row */}
                            <button
                              type="button"
                              onClick={() => handleRemove(sel.id)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                                pending?.clearSelection
                                  ? 'border-destructive bg-destructive/5 text-destructive font-medium'
                                  : 'border-border bg-card hover:bg-muted text-muted-foreground'
                              }`}
                            >
                              {t('changeRequest.removeType', { type: t(`mealTypes.${type}`) })}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}
          </div>

          <DrawerFooter className="px-4">
            <Button
              className="w-full"
              disabled={pendingCount === 0 || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? t('actions.submitting', { ns: 'common' })
                : pendingCount > 0
                  ? t('changeRequest.submitCount', { count: pendingCount })
                  : t('actions.submit', { ns: 'common' })}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
