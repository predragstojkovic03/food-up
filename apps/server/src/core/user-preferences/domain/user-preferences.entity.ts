import { ThemePreference } from '@food-up/shared';
import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';

export class UserPreferences extends Entity {
  static create(identityId: string, theme: ThemePreference = ThemePreference.System): UserPreferences {
    return new UserPreferences(generateId(), identityId, theme);
  }

  static reconstitute(id: string, identityId: string, theme: ThemePreference): UserPreferences {
    return new UserPreferences(id, identityId, theme);
  }

  private constructor(id: string, identityId: string, theme: ThemePreference) {
    super();
    this._id = id;
    this._identityId = identityId;
    this._theme = theme;
  }

  private readonly _id: string;
  private readonly _identityId: string;
  private _theme: ThemePreference;

  get id(): string { return this._id; }
  get identityId(): string { return this._identityId; }
  get theme(): ThemePreference { return this._theme; }
  set theme(theme: ThemePreference) { this._theme = theme; }
}
