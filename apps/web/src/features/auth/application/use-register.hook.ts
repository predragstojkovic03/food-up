import { useServices } from '@/shared/infrastructure/di/service.context';
import { useMutation, useQuery } from '@tanstack/react-query';
import { IRegisterEmployee, IRegisterSupplier } from '../domain/auth-service.interface';

export function useRegisterEmployee() {
  const { authService } = useServices();

  return useMutation({
    mutationFn: (data: IRegisterEmployee) => authService.registerEmployee(data),
  });
}

export function useRegisterSupplier() {
  const { authService } = useServices();

  return useMutation({
    mutationFn: (data: IRegisterSupplier) => authService.registerSupplier(data),
  });
}

export function useValidateInvite(token: string | null) {
  const { authService } = useServices();

  return useQuery({
    queryKey: ['invite-validate', token],
    queryFn: () => authService.validateInvite(token!),
    enabled: token !== null,
    retry: false,
  });
}
