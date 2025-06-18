import { Entity } from 'src/shared/domain/entity';

export class ChangeRequest extends Entity {
  constructor(
    id: string,
    employeeId: string,
    mealSelectionId: string,
    newMenuItemId: string,
    newQuantity: number | null,
    status: 'pending' | 'approved' | 'rejected',
    approvedBy?: string | null,
    approvedAt?: Date | null,
  ) {
    super();
    this.id = id;
    this.employeeId = employeeId;
    this.mealSelectionId = mealSelectionId;
    this.newMenuItemId = newMenuItemId;
    this.newQuantity = newQuantity;
    this.status = status;
    this.approvedBy = approvedBy ?? null;
    this.approvedAt = approvedAt ?? null;
  }

  readonly id: string;
  employeeId: string;
  mealSelectionId: string;
  newMenuItemId: string;
  newQuantity: number | null;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy: string | null;
  approvedAt: Date | null;
}
