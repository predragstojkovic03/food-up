import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'refresh_tokens' })
export class RefreshTokenTypeOrmEntity {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  identityId: string;

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
