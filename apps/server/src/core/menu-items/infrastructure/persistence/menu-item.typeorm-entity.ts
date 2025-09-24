import { MealSelection } from 'src/core/meal-selections/infrastructure/persistence/meal-selection.typeorm-entity';
import { Meal } from 'src/core/meals/infrastructure/persistence/meal.typeorm-entity';
import { MenuPeriod } from 'src/core/menu-periods/infrastructure/persistence/menu-period.typeorm-entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class MenuItem {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('decimal', { nullable: true })
  price: number | null;

  @ManyToOne(() => MenuPeriod, { eager: true })
  menuPeriod: MenuPeriod;

  @Column('date')
  day: string;

  @ManyToOne(() => Meal, (meal) => meal.menuItems, { eager: true })
  meal: Meal;

  @OneToMany(() => MealSelection, (mealSelection) => mealSelection.menuItem)
  mealSelections: MealSelection[];
}
