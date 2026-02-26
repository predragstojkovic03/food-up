import { Entity } from 'src/shared/domain/entity';
import { ulid } from 'ulid';
import { MenuItemCreatedEvent } from './events/menu-item-created.event';
import { MenuItemDayUpdatedEvent } from './events/menu-item-day-updated.event';
import { MenuItemPriceUpdatedEvent } from './events/menu-item-price-updated.event';

export class MenuItem extends Entity {
  constructor(
    id: string,
    price: number | null | undefined,
    menuPeriodId: string,
    day: string,
    mealId: string,
  ) {
    super();
    this.id = id;
    this._price = price ?? null;
    this._menuPeriodId = menuPeriodId;
    this._day = day;
    this._mealId = mealId;
  }

  static create(
    price: number | null | undefined,
    menuPeriodId: string,
    day: string,
    mealId: string,
  ): MenuItem {
    const menuItem = new MenuItem(ulid(), price, menuPeriodId, day, mealId);
    menuItem.addDomainEvent(new MenuItemCreatedEvent(menuItem.id));

    return menuItem;
  }

  readonly id: string;
  private _price: number | null;
  private _menuPeriodId: string;
  private _day: string;
  private _mealId: string;

  get price(): number | null {
    return this._price;
  }

  get menuPeriodId(): string {
    return this._menuPeriodId;
  }

  get day(): string {
    return this._day;
  }

  get mealId(): string {
    return this._mealId;
  }

  set price(value: number | null) {
    this._price = value;

    this.addDomainEvent(new MenuItemPriceUpdatedEvent(this.id, value));
  }

  set day(value: string) {
    this._day = value;

    this.addDomainEvent(new MenuItemDayUpdatedEvent(this.id, value));
  }
}
