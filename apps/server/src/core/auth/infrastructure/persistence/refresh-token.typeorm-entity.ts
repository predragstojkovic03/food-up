import { Identity } from 'src/core/identity/infrastructure/persistence/identity.typeorm-entity';
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshTokenTypeOrmEntity {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Index('IDX_refresh_token_identity_id')
  @Column('character varying', { length: 26, name: 'identity_id' })
  identityId: string;

  @ManyToOne(() => Identity, { nullable: false })
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;

  @Index('IDX_refresh_token_family_id')
  @Column('character varying', { length: 26 })
  familyId: string;

  @Column('varchar', { length: 255 })
  secretHash: string;

  @Column('timestamp with time zone')
  expiresAt: Date;

  @Column('timestamp with time zone', { nullable: true, default: null })
  usedAt: Date | null;

  @Column({ default: false })
  isRevoked: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
