import { useServices } from '@/shared/infrastructure/di/service.context';
import { useQuery } from '@tanstack/react-query';

export function useLatestBusinessWindow() {
  const { mealSelectionWindowService } = useServices();

  return useQuery({
    queryKey: ['meal-selection-windows', 'business-latest'],
    queryFn: async () => {
      const windows = await mealSelectionWindowService.getForMyBusiness();
      return windows[0] ?? null; // already sorted by startTime DESC
    },
  });
}
