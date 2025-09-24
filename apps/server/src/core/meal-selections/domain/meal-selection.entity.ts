import { Entity } from 'src/shared/domain/entity';
import { MealSelectionCreatedEvent } from './events/meal-selection-created.event';
import { MealSelectionUpdatedEvent } from './events/meal-selection-updated.event';

export class MealSelection extends Entity {
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

    this.id = id;
    this.employeeId = employeeId;
    this.menuItemId = menuItemId;
    this.mealSelectionWindowId = mealSelectionWindowId;
    this.quantity = quantity ?? null;
    this.date = date;

    this.addDomainEvent(new MealSelectionCreatedEvent(this.id));
  }

  update(menuItemId?: string, quantity?: number | null) {
    this.menuItemId = menuItemId ?? this.menuItemId;
    this.quantity = quantity ?? this.quantity;

    this.addDomainEvent(new MealSelectionUpdatedEvent(this.id));
  }

  readonly id: string;
  employeeId: string;
  menuItemId: string;
  mealSelectionWindowId: string;
  quantity: number | null;
  date: string;
}
