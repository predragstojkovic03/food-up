import { Language } from '@food-up/shared';
import { useEffect } from 'react';
import i18n from '@/i18n/i18n';
import { useAuthStore } from '@/features/auth/presentation/state/auth.store';
import { useServices } from '@/shared/infrastructure/di/service.context';
import { usePreferencesStore } from '../state/preferences.store';

const SEED_KEY = 'lang_seeded';

export function useLanguage(): void {
  const language = usePreferencesStore((s) => s.language);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);
}

export function useLanguageInit(): void {
  const user = useAuthStore((s) => s.user);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const { preferencesService } = useServices();

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(SEED_KEY)) return;

    const browserLang = navigator.language.toLowerCase().startsWith('sr')
      ? Language.Sr
      : Language.En;

    if (browserLang === Language.En) {
      localStorage.setItem(SEED_KEY, '1');
      return;
    }

    preferencesService
      .update({ language: browserLang })
      .then(() => {
        setLanguage(browserLang);
        localStorage.setItem(SEED_KEY, '1');
      })
      .catch(() => {
        localStorage.setItem(SEED_KEY, '1');
      });
  }, [user]);
}
