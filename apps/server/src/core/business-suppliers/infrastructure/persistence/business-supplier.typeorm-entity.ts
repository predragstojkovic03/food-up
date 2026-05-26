import { Language } from '@food-up/shared';
import { Business } from 'src/core/businesses/infrastructure/persistence/business.typeorm-entity';
import { Supplier } from 'src/core/suppliers/infrastructure/persistence/supplier.typeorm-entity';
import { Column, Entity, ManyToOne, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique('UQ_business_supplier_pair', ['business', 'supplier'])
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

  @Column('enum', { enum: Language, default: Language.En })
  language: Language;
}
