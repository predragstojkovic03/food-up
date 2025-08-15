import { BusinessSupplier } from 'src/core/business-suppliers/infrastructure/persistence/business-supplier.typeorm-entity';
import { Employee } from 'src/core/employees/infrastructure/persistence/employee.typeorm-entity';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class Business {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 100, unique: true })
  name: string;

  @Column('character varying', { length: 100, unique: true })
  contactEmail: string;

  @OneToMany(() => Employee, (employee) => employee.business, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  employees: Employee[]; // Changed to an array to reflect one-to-many relationship

  @OneToMany(
    () => BusinessSupplier,
    (businessSupplier) => businessSupplier.business,
  )
  businessSuppliers: BusinessSupplier[];
}
