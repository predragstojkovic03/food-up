import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IdentityType } from '../../domain/identity.entity';

@Entity()
export class Identity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true, length: 255 })
  email: string;

  @Column('varchar', { length: 255 })
  passwordHash: string;

  @Column('enum', { enum: ['employee', 'supplier', 'business'] })
  type: IdentityType;

  @Column('boolean', { default: true })
  isActive: boolean;
}
