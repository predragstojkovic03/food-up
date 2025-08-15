import { Employee } from 'src/core/employees/infrastructure/persistence/employee.typeorm-entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IdentityType } from '../../domain/identity.entity';

@Entity()
export class Identity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column('enum', { enum: ['employee', 'supplier', 'business'] })
  type: IdentityType;

  @Column()
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Employee)
  employee?: Employee;
}
