import { useServices } from '@/shared/infrastructure/di/service.context';
import { useQuery } from '@tanstack/react-query';

export function useWindowChangeRequests(windowId: string | undefined) {
  const { changeRequestService } = useServices();

  return useQuery({
    queryKey: ['change-requests', 'window', windowId],
    queryFn: () => changeRequestService.getByWindow(windowId!),
    enabled: !!windowId,
  });
}

export function useWindowPendingCount(windowId: string | undefined) {
  const { changeRequestService } = useServices();

  return useQuery({
    queryKey: ['change-requests', 'pending-count', windowId],
    queryFn: () => changeRequestService.getPendingCount(windowId!),
    enabled: !!windowId,
  });
}
