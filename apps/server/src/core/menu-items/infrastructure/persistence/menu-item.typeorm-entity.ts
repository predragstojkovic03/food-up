import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class MenuItem {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 100 })
  name: string;

  @Column('character varying', { length: 255 })
  description: string;

  @Column('decimal', { nullable: true })
  price: number | null;

  @Column('character varying', { length: 26 })
  menuPeriodId: string;

  @Column('date')
  day: Date;

  @Column('enum', { enum: ['breakfast', 'lunch', 'dinner'] })
  mealType: 'breakfast' | 'lunch' | 'dinner';
}
