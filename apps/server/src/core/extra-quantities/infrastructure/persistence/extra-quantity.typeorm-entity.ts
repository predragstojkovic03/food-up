import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ExtraQuantity {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  windowId: string;

  @Column('character varying', { length: 26 })
  menuItemId: string;

  @Column('int')
  quantity: number;

  @Column('varchar', { length: 255, nullable: true })
  guestName: string | null;
}
