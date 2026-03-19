import { useServices } from '@/shared/infrastructure/di/service.context';
import { useQuery } from '@tanstack/react-query';

export function useMySelectionsForWindow(windowId: string | undefined) {
  const { mealSelectionService } = useServices();

  return useQuery({
    queryKey: ['meal-selections', 'my', windowId],
    queryFn: () => mealSelectionService.getMySelectionsForWindow(windowId!),
    enabled: !!windowId,
  });
}
