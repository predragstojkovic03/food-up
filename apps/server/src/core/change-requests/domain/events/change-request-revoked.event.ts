import { ChangeRequestStatus } from '@food-up/shared';
import { IEvent } from 'src/shared/domain/event.interface';

export interface ChangeRequestRevokedPayload {
  changeRequestId: string;
  employeeId: string;
  status: ChangeRequestStatus;
}

export class ChangeRequestRevokedEvent implements IEvent {
  static readonly EVENT_NAME = 'changeRequest.revoked';
  readonly name = ChangeRequestRevokedEvent.EVENT_NAME;

  constructor(public readonly payload: ChangeRequestRevokedPayload) {}
}
