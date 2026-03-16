import { useServices } from '@/shared/infrastructure/di/service.context';
import { useQuery } from '@tanstack/react-query';

export function useBusinesses() {
  const { businessService } = useServices();

  return useQuery({
    queryKey: ['businesses'],
    queryFn: () => businessService.findAll(),
  });
}
