import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class ChangeRequest {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  employeeId: string;

  @Column('character varying', { length: 26 })
  mealSelectionId: string;

  @Column('character varying', { length: 26 })
  newMenuItemId: string;

  @Column('int', { nullable: true })
  newQuantity: number | null;

  @Column('enum', { enum: ['pending', 'approved', 'rejected'] })
  status: 'pending' | 'approved' | 'rejected';

  @Column('character varying', { length: 26, nullable: true })
  approvedBy: string | null;

  @Column('timestamp', { nullable: true })
  approvedAt: Date | null;
}
