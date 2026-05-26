import { Identity } from 'src/core/identity/infrastructure/persistence/identity.typeorm-entity';
import { Language, ThemePreference } from '@food-up/shared';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('user_preferences')
export class UserPreferencesTypeOrmEntity {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26, unique: true, name: 'identity_id' })
  identityId: string;

  @OneToOne(() => Identity, { nullable: false })
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;

  @Column('enum', { enum: ThemePreference, default: ThemePreference.System })
  theme: ThemePreference;

  @Column('enum', { enum: Language, default: Language.En })
  language: Language;
}
