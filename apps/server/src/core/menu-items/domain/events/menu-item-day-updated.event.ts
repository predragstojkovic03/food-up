import { IEvent } from 'src/shared/domain/event.interface';

export class MenuItemDayUpdatedEvent implements IEvent {
  name: string = 'menuItem.dayUpdated';
  constructor(
    public readonly menuItemId: string,
    public readonly newDay: string,
  ) {}
}
