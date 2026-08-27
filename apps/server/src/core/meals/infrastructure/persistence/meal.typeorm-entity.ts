import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { Supplier } from 'src/core/suppliers/infrastructure/persistence/supplier.typeorm-entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { DietaryTag, MealType } from '@food-up/shared';

@Entity()
export class Meal {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column('enum', { enum: MealType })
  type: MealType;

  @ManyToOne(() => Supplier, (supplier) => supplier.meals, { eager: true })
  supplier: Supplier;

  @Column('numeric', {
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: { from: (v: string | null) => (v != null ? Number(v) : undefined), to: (v) => v },
  })
  price?: number;

  @Column({ type: 'enum', enum: DietaryTag, array: true, default: '{}' })
  dietaryTags: DietaryTag[];

  @OneToMany(() => MenuItem, (menuItem) => menuItem.meal)
  menuItems: MenuItem[];
}
