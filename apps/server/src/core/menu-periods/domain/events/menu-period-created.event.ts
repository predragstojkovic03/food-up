import { IEvent } from 'src/shared/domain/event.interface';

export class MenuPeriodCreatedEvent implements IEvent {
  name: string = 'menuPeriod.created';
  constructor(public readonly menuPeriodId: string) {}
}
