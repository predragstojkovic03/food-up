import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ReportItem {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  reportId: string;

  @Column('character varying', { length: 26 })
  menuItemId: string;

  @Column('date')
  date: Date;

  @Column('int')
  quantity: number;
}
