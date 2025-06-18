import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class MealSelectionWindow {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;

  @Column('character varying', { length: 26 })
  businessId: string;

  @Column('character varying', { length: 26, nullable: true })
  menuPeriodId: string | null;
}
