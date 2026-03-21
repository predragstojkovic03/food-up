import { MealSelectionWindow } from 'src/core/meal-selection-windows/infrastructure/persistence/meal-selection-window.typeorm-entity';
import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class MealSelection {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  employeeId: string;

  @Column('character varying', { length: 26, nullable: true, name: 'menu_item_id' })
  menuItemId: string | null;

  @ManyToOne(() => MenuItem, (menuItem) => menuItem.mealSelections, {
    eager: true,
    nullable: true,
  })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem | null;

  @Column('character varying', { length: 26, name: 'meal_selection_window_id' })
  mealSelectionWindowId: string;

  @ManyToOne(
    () => MealSelectionWindow,
    (mealSelectionWindow) => mealSelectionWindow.mealSelections,
    { eager: true },
  )
  @JoinColumn({ name: 'meal_selection_window_id' })
  mealSelectionWindow: MealSelectionWindow;

  @Column('int', { nullable: true })
  quantity: number | null;

  @Column('date')
  date: string;
}
