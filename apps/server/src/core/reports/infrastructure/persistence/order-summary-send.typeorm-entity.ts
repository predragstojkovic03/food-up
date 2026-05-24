import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class OrderSummarySend {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  windowId: string;

  @Column('character varying', { length: 26 })
  supplierId: string;

  @Column('timestamptz')
  sentAt: Date;

  @Column('character varying', { length: 26 })
  sentByEmployeeId: string;

  @Column('varchar', { length: 500, default: '' })
  subject: string;

  @Column('text', { default: '' })
  htmlContent: string;
}
