import { Business } from 'src/core/businesses/infrastructure/persistence/business.typeorm-entity';
import { MealSelection } from 'src/core/meal-selections/infrastructure/persistence/meal-selection.typeorm-entity';
import { MenuPeriod } from 'src/core/menu-periods/infrastructure/persistence/menu-period.typeorm-entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class MealSelectionWindow {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('timestamp with time zone')
  startTime: Date;

  @Column('timestamp with time zone')
  endTime: Date;

  @ManyToOne(() => Business, (business) => business.mealSelectionWindows, {
    onDelete: 'CASCADE',
    eager: true,
  })
  business: Business;

  @Column('date', {
    array: true,
    transformer: {
      from: (values: (Date | string)[]) =>
        values?.map((v) => (v instanceof Date ? v.toISOString() : String(v)).split('T')[0]) ?? [],
      to: (values: string[]) => values,
    },
  })
  targetDates: string[];

  @ManyToMany(() => MenuPeriod, (menuPeriod) => menuPeriod.menuSelectionWindows, { eager: true })
  @JoinTable()
  menuPeriods: MenuPeriod[];

  @OneToMany(
    () => MealSelection,
    (mealSelection) => mealSelection.mealSelectionWindow,
  )
  mealSelections: MealSelection[];

  @Column('boolean', { default: true })
  isLocked: boolean;

  @Column('boolean', { default: false })
  notifyOnDeadline: boolean;
}
