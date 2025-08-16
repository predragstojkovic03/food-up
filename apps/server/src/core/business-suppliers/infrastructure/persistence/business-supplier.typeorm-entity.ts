import { Business } from 'src/core/businesses/infrastructure/persistence/business.typeorm-entity';
import { Supplier } from 'src/core/suppliers/infrastructure/persistence/supplier.typeorm-entity';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class BusinessSupplier {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @ManyToOne(() => Business, (business) => business.businessSuppliers, {
    eager: true,
  })
  business: Business;

  @ManyToOne(() => Supplier, (supplier) => supplier.businessSuppliers, {
    eager: true,
  })
  supplier: Supplier;
}
