import { MenuItem } from 'src/core/menu-items/infrastructure/persistence/menu-item.typeorm-entity';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { ChangeRequestStatus } from '../../domain/change-request-status.enum';

@Entity()
export class ChangeRequest {
  @PrimaryColumn('character varying', { length: 26 })
  id: string;

  @Column('character varying', { length: 26 })
  employeeId: string;

  @Column('character varying', { length: 26 })
  mealSelectionId: string;

  @ManyToOne(() => MenuItem, { nullable: true })
  newMenuItem: MenuItem;

  @Column('int', { nullable: true })
  newQuantity: number | null;

  @Column('boolean', { default: false })
  clearSelection: boolean;

  @Column('enum', { enum: ChangeRequestStatus })
  status: ChangeRequestStatus;

  @Column('character varying', { length: 26, nullable: true })
  approvedBy: string | null;

  @Column('timestamp', { nullable: true })
  approvedAt: Date | null;
}
