import { IEvent } from 'src/shared/domain/event.interface';

export class ChangeRequestCreatedEvent implements IEvent {
  name: string = 'changeRequest.created';

  constructor(public readonly changeRequestId: string) {}
}
