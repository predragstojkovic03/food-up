import { MealSelectionWindow } from 'src/core/meal-selection-windows/infrastructure/persistence/meal-selection-window.typeorm-entity';
import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class MealSelection {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  employeeId: string;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.mealSelections, {
    eager: true,
  })
  menuItem: MenuItem;

  @Column('character varying', { length: 26 })
  @ManyToOne(
    () => MealSelectionWindow,
    (mealSelectionWindow) => mealSelectionWindow.mealSelections,
    { eager: true },
  )
  mealSelectionWindow: MealSelectionWindow;

  @Column('int', { nullable: true })
  quantity: number | null;

  @Column('date')
  date: string;
}
