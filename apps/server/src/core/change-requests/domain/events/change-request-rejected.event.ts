import { ChangeRequestStatus } from '@food-up/shared';
import { IEvent } from 'src/shared/domain/event.interface';

export interface ChangeRequestRejectedPayload {
  changeRequestId: string;
  employeeId: string;
  status: ChangeRequestStatus;
}

export class ChangeRequestRejectedEvent implements IEvent {
  static readonly EVENT_NAME = 'changeRequest.rejected';
  readonly name = ChangeRequestRejectedEvent.EVENT_NAME;

  constructor(public readonly payload: ChangeRequestRejectedPayload) {}
}
