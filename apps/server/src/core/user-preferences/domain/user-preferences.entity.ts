import { Language, ThemePreference } from '@food-up/shared';
import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';

export class UserPreferences extends Entity {
  static create(
    identityId: string,
    theme: ThemePreference = ThemePreference.System,
    language: Language = Language.En,
  ): UserPreferences {
    return new UserPreferences(generateId(), identityId, theme, language);
  }

  static reconstitute(
    id: string,
    identityId: string,
    theme: ThemePreference,
    language: Language,
  ): UserPreferences {
    return new UserPreferences(id, identityId, theme, language);
  }

  private constructor(
    id: string,
    identityId: string,
    theme: ThemePreference,
    language: Language,
  ) {
    super();
    this._id = id;
    this._identityId = identityId;
    this._theme = theme;
    this._language = language;
  }

  private readonly _id: string;
  private readonly _identityId: string;
  private _theme: ThemePreference;
  private _language: Language;

  get id(): string { return this._id; }
  get identityId(): string { return this._identityId; }
  get theme(): ThemePreference { return this._theme; }
  set theme(theme: ThemePreference) { this._theme = theme; }
  get language(): Language { return this._language; }
  set language(language: Language) { this._language = language; }
}
