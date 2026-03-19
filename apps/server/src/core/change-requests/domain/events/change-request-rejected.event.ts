import { IEvent } from 'src/shared/domain/event.interface';

export class ChangeRequestRejectedEvent implements IEvent {
  name: string = 'changeRequest.rejected';

  constructor(
    public readonly changeRequestId: string,
    public readonly employeeId: string,
  ) {}
}
