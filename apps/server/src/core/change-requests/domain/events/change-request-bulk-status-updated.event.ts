import { ChangeRequestStatus } from '@food-up/shared';
import { IEvent } from 'src/shared/domain/event.interface';

export interface ChangeRequestBulkStatusUpdatedPayload {
  items: Array<{
    changeRequestId: string;
    employeeId: string;
    status: ChangeRequestStatus;
  }>;
}

export class ChangeRequestBulkStatusUpdatedEvent implements IEvent {
  static readonly EVENT_NAME = 'changeRequest.bulkStatusUpdated';
  readonly name = ChangeRequestBulkStatusUpdatedEvent.EVENT_NAME;

  constructor(public readonly payload: ChangeRequestBulkStatusUpdatedPayload) {}
}
