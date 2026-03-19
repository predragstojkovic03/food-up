import { useServices } from '@/shared/infrastructure/di/service.context';
import { useQuery } from '@tanstack/react-query';

export function useRelevantWindow() {
  const { mealSelectionWindowService } = useServices();

  return useQuery({
    queryKey: ['meal-selection-windows', 'relevant'],
    queryFn: () => mealSelectionWindowService.getRelevant(),
  });
}
