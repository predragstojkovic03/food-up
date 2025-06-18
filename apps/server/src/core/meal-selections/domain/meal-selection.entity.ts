import { Entity } from 'src/shared/domain/entity';

export class MealSelection extends Entity {
  constructor(
    id: string,
    employeeId: string,
    menuItemId: string,
    mealSelectionWindowId: string,
    quantity?: number | null,
  ) {
    super();
    this.id = id;
    this.employeeId = employeeId;
    this.menuItemId = menuItemId;
    this.mealSelectionWindowId = mealSelectionWindowId;
    this.quantity = quantity ?? null;
  }

  readonly id: string;
  employeeId: string;
  menuItemId: string;
  mealSelectionWindowId: string;
  quantity: number | null;
}
