import { ThemePreference } from '@food-up/shared';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('user_preferences')
export class UserPreferencesTypeOrmEntity {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26, unique: true })
  identityId: string;

  @Column('enum', { enum: ThemePreference, default: ThemePreference.System })
  theme: ThemePreference;
}
