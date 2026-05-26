import { Employee } from 'src/core/employees/infrastructure/persistence/employee.typeorm-entity';
import { MealSelectionWindow } from 'src/core/meal-selection-windows/infrastructure/persistence/meal-selection-window.typeorm-entity';
import { Supplier } from 'src/core/suppliers/infrastructure/persistence/supplier.typeorm-entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class OrderSummarySend {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26, name: 'window_id' })
  windowId: string;

  @ManyToOne(() => MealSelectionWindow, { nullable: false })
  @JoinColumn({ name: 'window_id' })
  window: MealSelectionWindow;

  @Column('character varying', { length: 26, name: 'supplier_id' })
  supplierId: string;

  @ManyToOne(() => Supplier, { nullable: false })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column('timestamptz')
  sentAt: Date;

  @Column('character varying', { length: 26, name: 'sent_by_employee_id' })
  sentByEmployeeId: string;

  @ManyToOne(() => Employee, { nullable: false })
  @JoinColumn({ name: 'sent_by_employee_id' })
  sentByEmployee: Employee;

  @Column('varchar', { length: 500, default: '' })
  subject: string;

  @Column('text', { default: '' })
  htmlContent: string;
}
