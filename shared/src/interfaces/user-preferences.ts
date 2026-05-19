import { ThemePreference } from '../enums/theme-preference.enum';

export interface IUserPreferencesResponse {
  theme: ThemePreference;
}

export interface IUpdateUserPreferences {
  theme?: ThemePreference;
}
