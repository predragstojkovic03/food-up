import { MenuPeriod } from 'src/core/menu-periods/infrastructure/persistence/menu-period.typeorm-entity';
import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class MealSelectionWindow {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('timestamp with time zone')
  startTime: Date;

  @Column('timestamp with time zone')
  endTime: Date;

  @Column('character varying', { length: 26 })
  businessId: string;

  @ManyToMany(() => MenuPeriod, (menuPeriod) => menuPeriod.menuSelectionWindows)
  @JoinTable()
  menuPeriods: MenuPeriod[];
}
