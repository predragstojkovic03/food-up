import { Entity } from 'src/shared/domain/entity';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { InvalidOperationException } from 'src/shared/domain/exceptions/invalid-operation.exception';
import { ChangeRequestStatus } from './change-request-status.enum';

export class ChangeRequest extends Entity {
  constructor(
    id: string,
    employeeId: string,
    mealSelectionId: string,
    newMenuItemId: string | null,
    newQuantity: number | null,
    status: ChangeRequestStatus,
    clearSelection?: boolean,
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
    this.clearSelection = clearSelection;
  }

  public updateSelection(
    newMenuItemId?: string,
    newQuantity?: number,
    clearSelection?: boolean,
  ) {
    if (this.status !== 'pending') {
      throw new InvalidOperationException(
        'Only change requests with status "pending" can be updated.',
      );
    }

    if (newQuantity !== undefined && newQuantity <= 0) {
      throw new InvalidInputDataException(
        'Quantity must be a positive integer.',
      );
    }

    this.newMenuItemId = newMenuItemId ?? this.newMenuItemId;
    this.newQuantity = newQuantity ?? this.newQuantity;
    this.clearSelection = clearSelection ?? this.clearSelection;
  }

  public changeStatus(
    status: ChangeRequestStatus,
    employeeId: string,
    date: Date,
  ) {
    if (this.status !== 'pending') {
      throw new InvalidOperationException(
        'Only change requests with status "pending" can have their status changed.',
      );
    }

    this.status = status;
    this.approvedBy = employeeId;
    this.approvedAt = date;
  }

  readonly id: string;
  employeeId: string;
  mealSelectionId: string;
  newMenuItemId: string | null;
  newQuantity: number | null;
  status: ChangeRequestStatus;
  approvedBy: string | null;
  approvedAt: Date | null;
  clearSelection?: boolean;
}
