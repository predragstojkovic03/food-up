import { MealSelectionWindow } from 'src/core/meal-selection-windows/infrastructure/persistence/meal-selection-window.typeorm-entity';
import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class MenuPeriod {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('timestamp with time zone')
  startDate: Date;

  @Column('timestamp with time zone')
  endDate: Date;

  @Column('character varying', { length: 26 })
  supplierId: string;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.menuPeriod)
  menuItems: MenuItem[];

  @ManyToMany(
    () => MealSelectionWindow,
    (mealSelectionWindow) => mealSelectionWindow.menuPeriods,
    {
      cascade: true,
    },
  )
  menuSelectionWindows: MealSelectionWindow[];
}
