import { useServices } from '@/shared/infrastructure/di/service.context';
import { IWindowDailyOverviewItem } from '@food-up/shared';
import { useQuery } from '@tanstack/react-query';

export function useWindowDailyOverview(windowId: string) {
  const { mealSelectionService } = useServices();
  return useQuery<IWindowDailyOverviewItem[]>({
    queryKey: ['meal-selections', 'daily-overview', windowId],
    queryFn: () => mealSelectionService.getDailyOverview(windowId),
  });
}
