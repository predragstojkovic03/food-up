import { Entity } from 'src/shared/domain/entity';
import { ulid } from 'ulid';
import { MealSelectionCreatedEvent } from './events/meal-selection-created.event';
import { MealSelectionMenuItemChangedEvent } from './events/meal-selection-menu-item-changed.event';
import { MealSelectionQuantityChangedEvent } from './events/meal-selection-quantity-changed.event';
import { MealSelectionUpdatedEvent } from './events/meal-selection-updated.event';

export class MealSelection extends Entity {
  static create(
    employeeId: string,
    menuItemId: string,
    mealSelectionWindowId: string,
    date: string,
    quantity?: number,
  ) {
    const mealSelection = new MealSelection(
      ulid(),
      employeeId,
      menuItemId,
      mealSelectionWindowId,
      date,
      quantity,
    );

    mealSelection.addDomainEvent(
      new MealSelectionCreatedEvent(mealSelection.id),
    );

    return mealSelection;
  }

  /**
   * Should not be used directly, use the factory method {@link create} instead.
   * @param id
   * @param employeeId
   * @param menuItemId
   * @param mealSelectionWindowId
   * @param date
   * @param quantity
   */
  constructor(
    id: string,
    employeeId: string,
    menuItemId: string,
    mealSelectionWindowId: string,
    date: string,
    quantity?: number | null,
  ) {
    super();

    this._id = id;
    this._employeeId = employeeId;
    this._menuItemId = menuItemId;
    this._mealSelectionWindowId = mealSelectionWindowId;
    this._quantity = quantity ?? null;
    this._date = date;
  }

  private readonly _id: string;
  private readonly _employeeId: string;
  private _menuItemId: string;
  private readonly _mealSelectionWindowId: string;
  private _quantity: number | null;
  private readonly _date: string;

  get id(): string {
    return this._id;
  }

  get employeeId(): string {
    return this._employeeId;
  }

  get menuItemId(): string {
    return this._menuItemId;
  }

  set menuItemId(value: string) {
    this._menuItemId = value;
    this.addDomainEvent(new MealSelectionMenuItemChangedEvent(this.id, value));
  }

  get mealSelectionWindowId(): string {
    return this._mealSelectionWindowId;
  }

  get quantity(): number | null {
    return this._quantity;
  }

  set quantity(value: number | null) {
    this._quantity = value;
    this.addDomainEvent(new MealSelectionQuantityChangedEvent(this.id, value));
  }

  get date(): string {
    return this._date;
  }

  update(menuItemId?: string, quantity?: number | null) {
    if (menuItemId !== undefined) {
      this.menuItemId = menuItemId;
    }
    if (quantity !== undefined) {
      this.quantity = quantity;
    }
    this.addDomainEvent(new MealSelectionUpdatedEvent(this.id));
  }
}
