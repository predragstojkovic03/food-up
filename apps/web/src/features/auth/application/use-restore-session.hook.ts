import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { usePreferencesStore } from '@/features/user-preferences/presentation/state/preferences.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { useEffect, useState } from 'react';

/**
 * On mount, checks for an existing token and fetches the current user.
 * Returns `true` once the check is complete so the app can safely render
 * protected routes without a flash of unauthenticated content.
 */
export function useRestoreSession(): boolean {
  const { authService, preferencesService } = useServices();
  const setUser = useAuthStore((s) => s.setUser);
  const setTheme = usePreferencesStore((s) => s.setTheme);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    authService
      .restoreSession()
      .then(async (user) => {
        if (user) {
          setUser(user);
          try {
            const prefs = await preferencesService.get();
            setTheme(prefs.theme);
            setLanguage(prefs.language);
          } catch {
            // keep defaults if preferences fetch fails
          }
        }
      })
      .finally(() => setReady(true));
  }, []);

  return ready;
}
