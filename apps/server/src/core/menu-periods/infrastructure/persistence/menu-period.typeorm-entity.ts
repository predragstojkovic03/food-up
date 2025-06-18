import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class MenuPeriod {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column('character varying', { length: 26 })
  supplierId: string;
}
