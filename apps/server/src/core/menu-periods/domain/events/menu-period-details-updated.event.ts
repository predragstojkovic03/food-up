import { IEvent } from 'src/shared/domain/event.interface';

export class MenuPeriodDetailsUpdatedEvent implements IEvent {
  name: string = 'menuPeriod.detailsUpdated';
  constructor(public readonly menuPeriodId: string) {}
}
