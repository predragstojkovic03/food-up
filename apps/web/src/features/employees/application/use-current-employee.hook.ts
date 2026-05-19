import { useServices } from '@/shared/infrastructure/di/service.context';
import { useQuery } from '@tanstack/react-query';

export function useCurrentEmployee() {
  const { employeeService } = useServices();
  return useQuery({
    queryKey: ['employee', 'me'],
    queryFn: () => employeeService.getMe(),
  });
}
