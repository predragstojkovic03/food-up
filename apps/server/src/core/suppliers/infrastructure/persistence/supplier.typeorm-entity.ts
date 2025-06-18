import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Supplier {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 100 })
  name: string;

  @Column('enum', { enum: ['registered', 'external'] })
  type: 'registered' | 'external';

  @Column('character varying', { length: 255 })
  contactInfo: string;

  @Column('character varying', { length: 26, nullable: true })
  businessId: string | null;

  @Column('character varying', { length: 26, nullable: true })
  userId: string | null;
}
