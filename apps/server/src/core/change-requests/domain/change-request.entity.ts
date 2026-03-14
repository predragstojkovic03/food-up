import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { InvalidOperationException } from 'src/shared/domain/exceptions/invalid-operation.exception';
import { ChangeRequestStatus } from './change-request-status.enum';
import { ChangeRequestCreatedEvent } from './events/change-request-created.event';
import { ChangeRequestSelectionUpdatedEvent } from './events/change-request-selection-updated.event';
import { ChangeRequestStatusUpdatedEvent } from './events/change-request-status-updated.event';

export class ChangeRequest extends Entity {
  static create(
    employeeId: string,
    mealSelectionWindowId: string,
    newMenuItemId: string | null,
    newQuantity: number | null,
    mealSelectionId?: string,
    clearSelection?: boolean,
  ): ChangeRequest {
    const changeRequest = new ChangeRequest(
      generateId(),
      employeeId,
      mealSelectionWindowId,
      newMenuItemId,
      newQuantity,
      ChangeRequestStatus.Pending,
      mealSelectionId,
      clearSelection,
      null,
      null,
    );
    changeRequest.addDomainEvent(new ChangeRequestCreatedEvent(changeRequest.id));
    return changeRequest;
  }

  static reconstitute(
    id: string,
    employeeId: string,
    mealSelectionWindowId: string,
    newMenuItemId: string | null,
    newQuantity: number | null,
    status: ChangeRequestStatus,
    mealSelectionId?: string,
    clearSelection?: boolean,
    approvedBy?: string | null,
    approvedAt?: Date | null,
  ): ChangeRequest {
    return new ChangeRequest(
      id,
      employeeId,
      mealSelectionWindowId,
      newMenuItemId,
      newQuantity,
      status,
      mealSelectionId,
      clearSelection,
      approvedBy,
      approvedAt,
    );
  }

  private constructor(
    id: string,
    employeeId: string,
    mealSelectionWindowId: string,
    newMenuItemId: string | null,
    newQuantity: number | null,
    status: ChangeRequestStatus,
    mealSelectionId?: string,
    clearSelection?: boolean,
    approvedBy?: string | null,
    approvedAt?: Date | null,
  ) {
    super();
    this.id = id;
    this.employeeId = employeeId;
    this.mealSelectionWindowId = mealSelectionWindowId;
    this.mealSelectionId = mealSelectionId;
    this.newMenuItemId = newMenuItemId;
    this.newQuantity = newQuantity;
    this.status = status;
    this.approvedBy = approvedBy ?? null;
    this.approvedAt = approvedAt ?? null;
    this.clearSelection = clearSelection;

    if (newQuantity !== null && newQuantity <= 0) {
      throw new InvalidInputDataException(
        'Quantity must be a positive integer.',
      );
    }

    if (mealSelectionId === undefined) {
      if (!newMenuItemId || newQuantity === null) {
        throw new InvalidInputDataException(
          'Late selection requests require newMenuItemId and newQuantity.',
        );
      }
      if (clearSelection) {
        throw new InvalidInputDataException(
          'Cannot clear a selection that does not exist.',
        );
      }
    }
  }

  public updateSelection(
    newMenuItemId?: string,
    newQuantity?: number,
    clearSelection?: boolean,
  ) {
    if (this.status !== ChangeRequestStatus.Pending) {
      throw new InvalidOperationException(
        `Only change requests with status "${ChangeRequestStatus.Pending}" can be updated.`,
      );
    }

    if (newQuantity !== undefined && newQuantity <= 0) {
      throw new InvalidInputDataException(
        'Quantity must be a positive integer.',
      );
    }

    if (this.mealSelectionId === undefined && clearSelection) {
      throw new InvalidInputDataException(
        'Cannot clear a selection that does not exist.',
      );
    }

    this.newMenuItemId = newMenuItemId ?? this.newMenuItemId;
    this.newQuantity = newQuantity ?? this.newQuantity;
    this.clearSelection = clearSelection ?? this.clearSelection;

    this.addDomainEvent(new ChangeRequestSelectionUpdatedEvent(this.id));
  }

  public changeStatus(
    status: ChangeRequestStatus,
    approvedBy: string,
    date: Date,
  ) {
    if (this.status !== ChangeRequestStatus.Pending) {
      throw new InvalidOperationException(
        `Only change requests with status "${ChangeRequestStatus.Pending}" can have their status changed.`,
      );
    }

    this.status = status;
    this.approvedBy = approvedBy;
    this.approvedAt = date;

    this.addDomainEvent(new ChangeRequestStatusUpdatedEvent(this.id));
  }

  readonly id: string;
  employeeId: string;
  mealSelectionWindowId: string;
  mealSelectionId: string | undefined;
  newMenuItemId: string | null;
  newQuantity: number | null;
  status: ChangeRequestStatus;
  approvedBy: string | null;
  approvedAt: Date | null;
  clearSelection?: boolean;
}
