import { Language } from '../enums/language.enum';
import { ThemePreference } from '../enums/theme-preference.enum';

export interface IUserPreferencesResponse {
  theme: ThemePreference;
  language: Language;
}

export interface IUpdateUserPreferences {
  theme?: ThemePreference;
  language?: Language;
}
