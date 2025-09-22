import { MealSelection } from 'src/core/meal-selections/infrastructure/persistence/meal-selection.typeorm-entity';
import { Meal } from 'src/core/meals/infrastructure/persistence/meal.typeorm-entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class MenuItem {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('decimal', { nullable: true })
  price: number | null;

  @Column('character varying', { length: 26 })
  menuPeriodId: string;

  @Column('date')
  day: Date;

  @ManyToOne(() => Meal, (meal) => meal.menuItems, { eager: true })
  meal: Meal;

  @OneToMany(() => MealSelection, (mealSelection) => mealSelection.menuItem)
  mealSelections: MealSelection[];
}
