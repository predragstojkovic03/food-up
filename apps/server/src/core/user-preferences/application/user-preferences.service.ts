import { Inject, Injectable } from '@nestjs/common';
import { Language, ThemePreference } from '@food-up/shared';
import { UserPreferences } from '../domain/user-preferences.entity';
import {
  I_USER_PREFERENCES_REPOSITORY,
  IUserPreferencesRepository,
} from '../domain/user-preferences.repository.interface';

@Injectable()
export class UserPreferencesService {
  constructor(
    @Inject(I_USER_PREFERENCES_REPOSITORY)
    private readonly _repository: IUserPreferencesRepository,
  ) {}

  async getOrCreate(identityId: string): Promise<UserPreferences> {
    const existing = await this._repository.findByIdentityId(identityId);
    if (existing) return existing;
    const prefs = UserPreferences.create(identityId);
    return this._repository.create(prefs);
  }

  async update(
    identityId: string,
    dto: { theme?: ThemePreference; language?: Language },
  ): Promise<UserPreferences> {
    const prefs = await this.getOrCreate(identityId);
    if (dto.theme !== undefined) prefs.theme = dto.theme;
    if (dto.language !== undefined) prefs.language = dto.language;
    return this._repository.update(prefs);
  }
}
