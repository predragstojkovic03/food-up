import { Supplier } from 'src/core/suppliers/infrastructure/persistence/supplier.typeorm-entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
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
}
