import { IEvent } from 'src/shared/domain/event.interface';

export class IdentityActiveStatusChangedEvent implements IEvent {
  name: string = 'identity.activeStatusChanged';
  constructor(
    public readonly identityId: string,
    public readonly isActive: boolean,
  ) {}
}
