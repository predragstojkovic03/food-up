import { BusinessSupplier } from 'src/core/business-suppliers/infrastructure/persistence/business-supplier.typeorm-entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

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

  @OneToMany(
    () => BusinessSupplier,
    (businessSupplier) => businessSupplier.supplier,
  )
  businessSuppliers: BusinessSupplier[];
}
