import { Column, Entity, PrimaryColumn } from 'typeorm';
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
}
