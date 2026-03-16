import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BusinessInvite {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  businessId: string;

  @Column('character varying', { length: 255 })
  email: string;

  @Column('character varying', { length: 36, unique: true })
  token: string;

  @Column('timestamp')
  expiresAt: Date;

  @Column('timestamp', { nullable: true })
  usedAt: Date | null;
}
