import { MealSelectionWindow } from 'src/core/meal-selection-windows/infrastructure/persistence/meal-selection-window.typeorm-entity';
import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class ExtraQuantity {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26, name: 'window_id' })
  windowId: string;

  @ManyToOne(() => MealSelectionWindow, { nullable: false })
  @JoinColumn({ name: 'window_id' })
  window: MealSelectionWindow;

  @Column('character varying', { length: 26, name: 'menu_item_id' })
  menuItemId: string;

  @ManyToOne(() => MenuItem, { nullable: false })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem;

  @Column('int')
  quantity: number;

  @Column('varchar', { length: 255, nullable: true })
  guestName: string | null;
}
