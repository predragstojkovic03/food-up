import { BusinessSupplier } from 'src/core/business-suppliers/infrastructure/persistence/business-supplier.typeorm-entity';
import { Business } from 'src/core/businesses/infrastructure/persistence/business.typeorm-entity';
import { Meal } from 'src/core/meals/infrastructure/persistence/meal.typeorm-entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { SupplierType } from '../../domain/supplier-type.enum';

@Entity()
export class Supplier {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 100 })
  name: string;

  @Column('enum', { enum: SupplierType })
  type: SupplierType;

  @Column('character varying', { length: 255 })
  contactInfo: string;

  @OneToMany(
    () => BusinessSupplier,
    (businessSupplier) => businessSupplier.supplier,
  )
  businessSuppliers: BusinessSupplier[];

  @ManyToOne(() => Business, (business) => business.managedSuppliers, {
    nullable: true,
  })
  managingBusiness?: Business | null;

  @OneToMany(() => Meal, (meal) => meal.supplier, { eager: true })
  meals: Meal[];
}
