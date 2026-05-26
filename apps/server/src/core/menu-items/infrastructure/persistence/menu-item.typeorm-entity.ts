import { MealSelection } from 'src/core/meal-selections/infrastructure/persistence/meal-selection.typeorm-entity';
import { Meal } from 'src/core/meals/infrastructure/persistence/meal.typeorm-entity';
import { MenuPeriod } from 'src/core/menu-periods/infrastructure/persistence/menu-period.typeorm-entity';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique('UQ_menu_item_period_meal_day', ['menuPeriod', 'meal', 'day'])
export class MenuItem {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('decimal', {
    nullable: true,
    transformer: { from: (v: string | null) => (v != null ? Number(v) : null), to: (v) => v },
  })
  price: number | null;

  @Index('IDX_menu_item_menu_period_id')
  @ManyToOne(() => MenuPeriod, { eager: true, onDelete: 'CASCADE' })
  menuPeriod: MenuPeriod;

  @Column('date')
  day: string;

  @Index('IDX_menu_item_meal_id')
  @ManyToOne(() => Meal, (meal) => meal.menuItems, { eager: true })
  meal: Meal;

  @OneToMany(() => MealSelection, (mealSelection) => mealSelection.menuItem)
  mealSelections: MealSelection[];
}
