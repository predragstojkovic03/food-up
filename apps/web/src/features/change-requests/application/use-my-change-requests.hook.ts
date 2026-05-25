import { useServices } from '@/shared/infrastructure/di/service.context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMyChangeRequests() {
  const { changeRequestService } = useServices();

  return useQuery({
    queryKey: ['change-requests', 'my'],
    queryFn: () => changeRequestService.getMy(),
  });
}

export function useRevokeChangeRequest() {
  const { changeRequestService } = useServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => changeRequestService.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-requests', 'my'] });
    },
  });
}
