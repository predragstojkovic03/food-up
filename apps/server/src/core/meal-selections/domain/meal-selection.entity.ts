import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';
import { MealSelectionCreatedEvent } from './events/meal-selection-created.event';
import { MealSelectionMenuItemChangedEvent } from './events/meal-selection-menu-item-changed.event';
import { MealSelectionQuantityChangedEvent } from './events/meal-selection-quantity-changed.event';
import { MealSelectionUpdatedEvent } from './events/meal-selection-updated.event';

export class MealSelection extends Entity {
  static create(
    employeeId: string,
    mealSelectionWindowId: string,
    date: string,
    menuItemId?: string,
    quantity?: number,
  ): MealSelection {
    const mealSelection = new MealSelection(
      generateId(),
      employeeId,
      mealSelectionWindowId,
      date,
      menuItemId,
      quantity,
    );

    mealSelection.addDomainEvent(
      new MealSelectionCreatedEvent(mealSelection.id),
    );

    return mealSelection;
  }

  static reconstitute(
    id: string,
    employeeId: string,
    mealSelectionWindowId: string,
    date: string,
    menuItemId?: string,
    quantity?: number | null,
  ): MealSelection {
    return new MealSelection(
      id,
      employeeId,
      mealSelectionWindowId,
      date,
      menuItemId,
      quantity ?? undefined,
    );
  }

  private constructor(
    id: string,
    employeeId: string,
    mealSelectionWindowId: string,
    date: string,
    menuItemId?: string,
    quantity?: number,
  ) {
    super();

    this._id = id;
    this._employeeId = employeeId;
    this._mealSelectionWindowId = mealSelectionWindowId;
    this._date = date;
    this._menuItemId = menuItemId;
    this._quantity = quantity;
  }

  private readonly _id: string;
  private readonly _employeeId: string;
  private _menuItemId: string | undefined;
  private readonly _mealSelectionWindowId: string;
  private _quantity: number | undefined;
  private readonly _date: string;

  get id(): string {
    return this._id;
  }

  get employeeId(): string {
    return this._employeeId;
  }

  get menuItemId(): string | undefined {
    return this._menuItemId;
  }

  set menuItemId(value: string | undefined) {
    this._menuItemId = value;
    this.addDomainEvent(new MealSelectionMenuItemChangedEvent(this.id, value));
  }

  get mealSelectionWindowId(): string {
    return this._mealSelectionWindowId;
  }

  get quantity(): number | undefined {
    return this._quantity;
  }

  set quantity(value: number | undefined) {
    this._quantity = value;
    this.addDomainEvent(new MealSelectionQuantityChangedEvent(this.id, value));
  }

  get date(): string {
    return this._date;
  }

  // menuItemId: undefined = don't change, null = set to skip (clear), string = change to this item
  // quantity:   undefined = don't change, null = set to skip (clear)
  update(menuItemId?: string | null, quantity?: number | null) {
    if (menuItemId !== undefined) {
      this.menuItemId = menuItemId ?? undefined;
    }
    if (quantity !== undefined) {
      this.quantity = quantity ?? undefined;
    }
    this.addDomainEvent(new MealSelectionUpdatedEvent(this.id));
  }
}
