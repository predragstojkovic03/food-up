import { ThemePreference } from '@food-up/shared';
import { create } from 'zustand';

type PreferencesState = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  theme: ThemePreference.System,
  setTheme: (theme) => set({ theme }),
}));
