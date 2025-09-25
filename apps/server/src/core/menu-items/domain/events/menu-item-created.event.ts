import { IEvent } from 'src/shared/domain/event.interface';

export class MenuItemCreatedEvent implements IEvent {
  name: string = 'menuItem.created';
  constructor(public readonly menuItemId: string) {}
}
