import { IEvent } from 'src/shared/domain/event.interface';

export class ChangeRequestSelectionUpdatedEvent implements IEvent {
  name: string = 'changeRequest.selectionUpdated';

  constructor(public readonly changeRequestId: string) {}
}
