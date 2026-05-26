import { BusinessSupplier } from 'src/core/business-suppliers/infrastructure/persistence/business-supplier.typeorm-entity';
import { Business } from 'src/core/businesses/infrastructure/persistence/business.typeorm-entity';
import { Identity } from 'src/core/identity/infrastructure/persistence/identity.typeorm-entity';
import { Meal } from 'src/core/meals/infrastructure/persistence/meal.typeorm-entity';
import { MenuPeriod } from 'src/core/menu-periods/infrastructure/persistence/menu-period.typeorm-entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Language, SupplierType } from '@food-up/shared';

@Entity()
@Check(`type != '${SupplierType.Standalone}' OR identity_id IS NOT NULL`)
export class Supplier {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 100 })
  name: string;

  @Column('enum', { enum: SupplierType })
  type: SupplierType;

  @Column('character varying', { length: 255, name: 'email', nullable: true })
  email: string | null;

  @Column('enum', { enum: Language, default: Language.En })
  language: Language;

  @OneToMany(
    () => BusinessSupplier,
    (businessSupplier) => businessSupplier.supplier,
  )
  businessSuppliers: BusinessSupplier[];

  @Column('character varying', {
    length: 26,
    nullable: true,
    name: 'identity_id',
  })
  identityId: string;

  @OneToOne(() => Identity, { nullable: true, cascade: true, eager: true })
  @JoinColumn({ name: 'identity_id' })
  identity: Identity;

  @Column('character varying', {
    length: 26,
    nullable: true,
    name: 'managing_business_id',
  })
  managingBusinessId: string | null;

  @ManyToOne(() => Business, (business) => business.managedSuppliers, {
    nullable: true,
  })
  @JoinColumn({ name: 'managing_business_id' })
  managingBusiness?: Business | null;

  @OneToMany(() => Meal, (meal) => meal.supplier)
  meals: Meal[];

  @OneToMany(() => MenuPeriod, (menuPeriod) => menuPeriod.supplier)
  menuPeriods: MenuPeriod[];

}
