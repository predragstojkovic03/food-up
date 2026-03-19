import { useServices } from '@/shared/infrastructure/di/service.context';
import { useQuery } from '@tanstack/react-query';

export function useMyChangeRequests() {
  const { changeRequestService } = useServices();

  return useQuery({
    queryKey: ['change-requests', 'my'],
    queryFn: () => changeRequestService.getMy(),
  });
}
