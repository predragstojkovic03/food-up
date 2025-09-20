import { Employee } from 'src/core/employees/infrastructure/persistence/employee.typeorm-entity';
import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { IdentityType } from '../../domain/identity.entity';

@Entity()
export class Identity {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('varchar', { unique: true, length: 255 })
  email: string;

  @Column('varchar', { length: 255 })
  passwordHash: string;

  @Column('enum', { enum: IdentityType })
  type: IdentityType;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Employee)
  employee?: Employee;
}
