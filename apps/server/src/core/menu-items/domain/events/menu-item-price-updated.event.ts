import { IEvent } from 'src/shared/domain/event.interface';

export class MenuItemPriceUpdatedEvent implements IEvent {
  name: string = 'menuItem.priceUpdated';
  constructor(
    public readonly menuItemId: string,
    public readonly newPrice: number | null,
  ) {}
}
