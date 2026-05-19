import { UserPreferences } from './user-preferences.entity';

export const I_USER_PREFERENCES_REPOSITORY = Symbol('IUserPreferencesRepository');

export interface IUserPreferencesRepository {
  findByIdentityId(identityId: string): Promise<UserPreferences | null>;
  create(prefs: UserPreferences): Promise<UserPreferences>;
  update(prefs: UserPreferences): Promise<UserPreferences>;
}
