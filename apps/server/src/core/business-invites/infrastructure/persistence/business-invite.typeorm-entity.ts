import { Business } from 'src/core/businesses/infrastructure/persistence/business.typeorm-entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class BusinessInvite {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26, name: 'business_id' })
  businessId: string;

  @ManyToOne(() => Business, { nullable: false })
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column('character varying', { length: 255 })
  email: string;

  @Column('character varying', { length: 36, unique: true })
  token: string;

  @Column('timestamp')
  expiresAt: Date;

  @Column('timestamp', { nullable: true })
  usedAt: Date | null;

  @Column('timestamp', { nullable: true })
  emailSentAt: Date | null;
}
