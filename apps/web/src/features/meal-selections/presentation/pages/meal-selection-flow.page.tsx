import { useServices } from '@/shared/infrastructure/di/service.context';
import { useMySelectionsForWindow } from '@/features/meal-selections/application/use-my-selections.hook';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MealType, IGetCurrentMealSelectionWindowResponse } from '@food-up/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DayStep } from './components/day-step';
import { FlowProgress } from './components/flow-progress';
import { SelectionSummary } from './components/selection-summary';
import { DaySelection, MenuItemOption } from './types';

const TYPE_ORDER: MealType[] = [
  MealType.Breakfast,
  MealType.Soup,
  MealType.Lunch,
  MealType.Dinner,
  MealType.Salad,
  MealType.Dessert,
];

function buildItemsByType(
  items: IGetCurrentMealSelectionWindowResponse['menuItems'],
  date: string,
): Partial<Record<MealType, MenuItemOption[]>> {
  const result: Partial<Record<MealType, MenuItemOption[]>> = {};
  for (const item of items) {
    if (item.day !== date) continue;
    const type = item.meal.type;
    if (!result[type]) result[type] = [];
    result[type]!.push({
      id: item.id,
      name: item.meal.name,
      description: item.meal.description,
      type,
      price: item.price,
    });
  }
  return result;
}

function randomizeDay(
  itemsByType: Partial<Record<MealType, MenuItemOption[]>>,
): Partial<Record<MealType, string>> {
  const choices: Partial<Record<MealType, string>> = {};
  for (const type of TYPE_ORDER) {
    const items = itemsByType[type];
    if (items?.length) {
      choices[type] = items[Math.floor(Math.random() * items.length)].id;
    }
  }
  return choices;
}

export default function MealSelectionFlowPage() {
  const { windowId } = useParams<{ windowId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mealSelectionWindowService, mealSelectionService } = useServices();

  const { data: windowData, isLoading: windowLoading } = useQuery({
    queryKey: ['meal-selection-windows', 'current', windowId],
    queryFn: () => mealSelectionWindowService.getCurrent(),
    enabled: !!windowId,
  });

  const { data: existingSelections = [], isLoading: selectionsLoading } =
    useMySelectionsForWindow(windowId);

  const [daySelections, setDaySelections] = useState<DaySelection[]>([]);
  const [step, setStep] = useState<number>(0); // index into targetDates; targetDates.length = summary
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialized = useRef(false);

  // Initialise flow state once both window and existing selections are loaded
  useEffect(() => {
    if (!windowData || selectionsLoading || initialized.current) return;
    initialized.current = true;

    const activeDates = windowData.targetDates.filter((date) =>
      windowData.menuItems.some((item) => item.day === date),
    );

    const initial: DaySelection[] = activeDates.map((date) => {
      const existing = existingSelections.filter((s) => s.date === date);
      const choices: Partial<Record<MealType, string>> = {};
      const existingIds: Partial<Record<MealType, string>> = {};
      let skipped = false;

      for (const s of existing) {
        if (s.menuItemId === null) {
          skipped = true;
        } else if (s.meal) {
          choices[s.meal.type] = s.menuItemId;
          existingIds[s.meal.type] = s.id;
        }
      }

      return { date, skipped, choices, existingIds };
    });

    setDaySelections(initial);
  }, [windowData, existingSelections]);

  const allItems: MenuItemOption[] = windowData
    ? windowData.menuItems.map((i) => ({
        id: i.id,
        name: i.meal.name,
        description: i.meal.description,
        type: i.meal.type,
        price: i.price,
      }))
    : [];

  const activeDates = windowData
    ? windowData.targetDates.filter((date) =>
        windowData.menuItems.some((item) => item.day === date),
      )
    : [];

  const totalDays = activeDates.length;
  const isSummaryStep = step === totalDays;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChoose = useCallback((type: MealType, itemId: string) => {
    setDaySelections((prev) => {
      const next = [...prev];
      next[step] = {
        ...next[step],
        skipped: false,
        choices: { ...next[step].choices, [type]: itemId },
      };
      return next;
    });
  }, [step]);

  const handleSkipDay = useCallback(() => {
    setDaySelections((prev) => {
      const next = [...prev];
      const current = next[step];
      const willSkip = !current.skipped;
      next[step] = { ...current, skipped: willSkip, choices: willSkip ? {} : current.choices };
      return next;
    });
  }, [step]);

  const handleRandomizeDay = useCallback((dayIndex: number) => {
    if (!windowData) return;
    const date = windowData.targetDates[dayIndex];
    const itemsByType = buildItemsByType(windowData.menuItems, date);
    setDaySelections((prev) => {
      const next = [...prev];
      next[dayIndex] = {
        ...next[dayIndex],
        skipped: false,
        choices: randomizeDay(itemsByType),
      };
      return next;
    });
  }, [windowData]);

  const handleRandomizeRemaining = useCallback(() => {
    if (!windowData) return;
    setDaySelections((prev) => {
      const next = [...prev];
      for (let i = step; i < totalDays; i++) {
        const date = windowData.targetDates[i];
        const itemsByType = buildItemsByType(windowData.menuItems, date);
        next[i] = { ...next[i], skipped: false, choices: randomizeDay(itemsByType) };
      }
      return next;
    });
  }, [windowData, step, totalDays]);

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, totalDays));
  }, [totalDays]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleEditDay = useCallback((index: number) => {
    setStep(index);
  }, []);

  const handleExit = useCallback(() => {
    navigate('/employee');
  }, [navigate]);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleConfirm = useCallback(async () => {
    if (!windowId || !windowData) return;
    setIsSubmitting(true);

    try {
      await Promise.all(
        daySelections.map(async (day) => {
          if (day.skipped) {
            // Upsert a skip record (null menuItemId) for this date
            const existingSkipId = Object.values(day.existingIds)[0]; // reuse any existing record
            if (existingSkipId) {
              await mealSelectionService.update(existingSkipId, {
                menuItemId: null,
                quantity: null,
              });
            } else {
              await mealSelectionService.create({
                mealSelectionWindowId: windowId,
                date: day.date,
              });
            }
            return;
          }

          // For each chosen type, create or update
          for (const type of TYPE_ORDER) {
            const chosenId = day.choices[type];
            if (!chosenId) continue;
            const existingId = day.existingIds[type];
            if (existingId) {
              await mealSelectionService.update(existingId, {
                menuItemId: chosenId,
                quantity: 1,
              });
            } else {
              await mealSelectionService.create({
                mealSelectionWindowId: windowId,
                date: day.date,
                menuItemId: chosenId,
                quantity: 1,
              });
            }
          }
        }),
      );

      queryClient.invalidateQueries({ queryKey: ['meal-selections', 'my', windowId] });
      queryClient.invalidateQueries({ queryKey: ['meal-selection-windows', 'relevant'] });
      navigate('/employee');
    } finally {
      setIsSubmitting(false);
    }
  }, [daySelections, windowId, windowData, mealSelectionService, queryClient, navigate]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (windowLoading || selectionsLoading || daySelections.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-4 space-y-4 px-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  const currentDate = activeDates[step];
  const currentSelection = daySelections[step];
  const itemsByType = currentDate
    ? buildItemsByType(windowData!.menuItems, currentDate)
    : {};

  const isDayComplete =
    !isSummaryStep &&
    (currentSelection?.skipped || Object.keys(currentSelection?.choices ?? {}).length > 0);

  // Slide direction tracked via step changes
  return (
    <div className="max-w-lg mx-auto py-4 px-4 flex flex-col gap-6 pb-10">
      {!isSummaryStep && (
        <>
          <FlowProgress
            current={step}
            total={totalDays}
            date={currentDate}
            onBack={step > 0 ? handleBack : undefined}
            onExit={handleExit}
          />

          <div className="animate-in fade-in slide-in-from-right-4 duration-200">
            <DayStep
              date={currentDate}
              itemsByType={itemsByType}
              selection={currentSelection}
              hasRemainingDays={step < totalDays - 1}
              onChoose={handleChoose}
              onSkipDay={handleSkipDay}
              onRandomizeDay={() => handleRandomizeDay(step)}
              onRandomizeRemaining={handleRandomizeRemaining}
            />
          </div>

          <Button className="w-full" size="lg" onClick={handleNext} disabled={!isDayComplete}>
            {step < totalDays - 1 ? 'Next day' : 'Review selections'}
          </Button>
          {!isDayComplete && (
            <p className="text-center text-xs text-muted-foreground -mt-4">
              Select at least one meal or skip this day to continue.
            </p>
          )}
        </>
      )}

      {isSummaryStep && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-200">
          <SelectionSummary
            selections={daySelections}
            allItems={allItems}
            onEditDay={handleEditDay}
            onConfirm={handleConfirm}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
}
