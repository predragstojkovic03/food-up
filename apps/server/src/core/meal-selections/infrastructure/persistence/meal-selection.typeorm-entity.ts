import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class MealSelection {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  employeeId: string;

  @Column('character varying', { length: 26 })
  menuItemId: string;

  @Column('character varying', { length: 26 })
  mealSelectionWindowId: string;

  @Column('int', { nullable: true })
  quantity: number | null;
}
