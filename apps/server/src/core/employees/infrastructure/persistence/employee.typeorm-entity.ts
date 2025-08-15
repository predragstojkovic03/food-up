import { Business } from 'src/core/businesses/infrastructure/persistence/business.typeorm-entity';
import { Identity } from 'src/core/identity/infrastructure/persistence/identity.typeorm-entity';
import { Role } from 'src/shared/domain/role.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Employee {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 100 })
  name: string;

  @Column('enum', { enum: Role, default: Role.Basic })
  role: Role;

  @ManyToOne(() => Business, (business) => business.employees)
  business?: Business;

  @OneToOne(() => Identity, { nullable: false, cascade: true, eager: true })
  @JoinColumn()
  identity: Identity;
}
