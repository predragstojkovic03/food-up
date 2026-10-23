import { useServices } from '@/shared/infrastructure/di/service.context';
import { ChangeRequestStatus } from '@food-up/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface BulkUpdateChangeRequests {
  approve: (ids: string[]) => void;
  reject: (ids: string[]) => void;
  isPending: boolean;
}

export function useBulkUpdateChangeRequests(windowId: string | undefined): BulkUpdateChangeRequests {
  const { changeRequestService } = useServices();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: ChangeRequestStatus }) =>
      changeRequestService.bulkUpdateStatus({ items: ids.map((id) => ({ id, status })) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['change-requests', 'window', windowId] });
      queryClient.invalidateQueries({ queryKey: ['change-requests', 'pending-count', windowId] });
      queryClient.invalidateQueries({ queryKey: ['meal-selections', 'daily-overview', windowId] });
    },
  });

  function update(ids: string[], status: ChangeRequestStatus) {
    if (ids.length > 0) mutation.mutate({ ids, status });
  }

  return {
    approve: (ids) => update(ids, ChangeRequestStatus.Approved),
    reject: (ids) => update(ids, ChangeRequestStatus.Rejected),
    isPending: mutation.isPending,
  };
}
