import { Business } from 'src/core/businesses/infrastructure/persistence/business.typeorm-entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Employee {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 100 })
  name: string;

  @Column('character varying', { length: 100, unique: true })
  email: string;

  @Column('boolean', { default: false })
  isAdmin: boolean;

  @OneToMany(() => Business, (business) => business.employees)
  business?: Business;
}
