import { ThemePreference } from '@food-up/shared';
import { useEffect } from 'react';
import { usePreferencesStore } from '../state/preferences.store';

function resolveEffective(theme: ThemePreference): 'dark' | 'light' {
  if (theme === ThemePreference.System) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme === ThemePreference.Dark ? 'dark' : 'light';
}

export function useTheme(): void {
  const theme = usePreferencesStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    function apply() {
      root.classList.toggle('dark', resolveEffective(theme) === 'dark');
    }

    apply();

    if (theme === ThemePreference.System) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);
}
