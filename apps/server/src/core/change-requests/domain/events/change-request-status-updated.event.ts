import { IEvent } from 'src/shared/domain/event.interface';

export class ChangeRequestStatusUpdatedEvent implements IEvent {
  name: string = 'changeRequest.statusUpdated';

  constructor(public readonly changeRequestId: string) {}
}
