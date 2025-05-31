import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Business {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 100, unique: true })
  name: string;

  @Column('character varying', { length: 100, unique: true })
  contactEmail: string;
}
