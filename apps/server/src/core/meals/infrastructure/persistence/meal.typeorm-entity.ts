import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { Supplier } from 'src/core/suppliers/infrastructure/persistence/supplier.typeorm-entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';
import { MealType } from '../../domain/meal.entity';

@Entity()
export class Meal {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('enum', { enum: ['breakfast', 'lunch', 'dinner'] })
  type: MealType;

  @ManyToOne(() => Supplier, (supplier) => supplier.meals)
  supplier: Supplier;

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  price?: number;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.meal)
  menuItems: MenuItem[];
}
