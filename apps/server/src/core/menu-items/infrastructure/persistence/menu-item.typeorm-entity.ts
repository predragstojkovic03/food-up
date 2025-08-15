import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class MenuItem {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('decimal', { nullable: true })
  price: number | null;

  @Column('character varying', { length: 26 })
  menuPeriodId: string;

  @Column('date')
  day: Date;

  @Column('character varying', { length: 26 })
  mealId: string;
}
