import { Language, ThemePreference } from '@food-up/shared';
import { create } from 'zustand';

type PreferencesState = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  language: Language;
  setLanguage: (language: Language) => void;
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  theme: ThemePreference.System,
  setTheme: (theme) => set({ theme }),
  language: Language.En,
  setLanguage: (language) => set({ language }),
}));
