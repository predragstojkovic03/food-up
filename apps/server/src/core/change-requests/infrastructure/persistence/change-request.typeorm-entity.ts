import { MealSelection } from 'src/core/meal-selections/infrastructure/persistence/meal-selection.typeorm-entity';
import { MealSelectionWindow } from 'src/core/meal-selection-windows/infrastructure/persistence/meal-selection-window.typeorm-entity';
import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ChangeRequestStatus } from '@food-up/shared';

@Entity()
export class ChangeRequest {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  employeeId: string;

  @Column('character varying', { length: 26, name: 'meal_selection_window_id' })
  mealSelectionWindowId: string;

  @ManyToOne(() => MealSelectionWindow)
  @JoinColumn({ name: 'meal_selection_window_id' })
  mealSelectionWindow: MealSelectionWindow;

  @Column('character varying', { length: 26, nullable: true, name: 'meal_selection_id' })
  mealSelectionId: string | null;

  @ManyToOne(() => MealSelection, { nullable: true })
  @JoinColumn({ name: 'meal_selection_id' })
  mealSelection: MealSelection | null;

  @Column('character varying', { length: 26, nullable: true, name: 'new_menu_item_id' })
  newMenuItemId: string | null;

  @ManyToOne(() => MenuItem, { nullable: true })
  @JoinColumn({ name: 'new_menu_item_id' })
  newMenuItem: MenuItem | null;

  @Column('int', { nullable: true })
  newQuantity: number | null;

  @Column('boolean', { default: false })
  clearSelection: boolean;

  @Column('enum', { enum: ChangeRequestStatus })
  status: ChangeRequestStatus;

  @Column('character varying', { length: 26, nullable: true })
  approvedBy: string | null;

  @Column('timestamp', { nullable: true })
  approvedAt: Date | null;
}
