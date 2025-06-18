import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BusinessSupplier {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  businessId: string;

  @Column('character varying', { length: 26 })
  supplierId: string;

  @Column('boolean')
  isManaged: boolean;
}
