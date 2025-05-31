import { useServices } from '@/shared/infrastructure/di/service.context';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../presentation/state/auth.store';

export function useLogin() {
  const { authService } = useServices();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (user) => setUser(user),
  });
}
