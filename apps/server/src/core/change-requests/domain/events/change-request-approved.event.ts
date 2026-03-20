import { ChangeRequestStatus } from '@food-up/shared';
import { IEvent } from 'src/shared/domain/event.interface';

export interface ChangeRequestApprovedPayload {
  changeRequestId: string;
  employeeId: string;
  mealSelectionId: string | undefined;
  newMenuItemId: string | null;
  newQuantity: number | null;
  clearSelection: boolean;
  status: ChangeRequestStatus;
}

export class ChangeRequestApprovedEvent implements IEvent {
  static readonly EVENT_NAME = 'changeRequest.approved';
  readonly name = ChangeRequestApprovedEvent.EVENT_NAME;

  constructor(public readonly payload: ChangeRequestApprovedPayload) {}
}
