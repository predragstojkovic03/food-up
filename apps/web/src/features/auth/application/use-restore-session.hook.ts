import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { useEffect, useState } from 'react';

/**
 * On mount, checks for an existing token and fetches the current user.
 * Returns `true` once the check is complete so the app can safely render
 * protected routes without a flash of unauthenticated content.
 */
export function useRestoreSession(): boolean {
  const { authService } = useServices();
  const setUser = useAuthStore((s) => s.setUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    authService
      .restoreSession()
      .then((user) => {
        if (user) setUser(user);
      })
      .finally(() => setReady(true));
  }, []);

  return ready;
}
