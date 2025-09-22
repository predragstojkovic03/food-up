import { MealSelectionWindow } from 'src/core/meal-selection-windows/domain/meal-selection-window.entity';
import { Entity } from 'src/shared/domain/entity';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';

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
    date: Date,
    quantity?: number | null,
  ) {
    super();

    this.id = id;
    this.employeeId = employeeId;
    this.menuItemId = menuItemId;
    this.mealSelectionWindowId = mealSelectionWindowId;
    this.quantity = quantity ?? null;
    this.date = date;
  }

  readonly id: string;
  employeeId: string;
  menuItemId: string;
  mealSelectionWindowId: string;
  quantity: number | null;
  date: Date;

  /**
   * Factory method to create a valid MealSelection instance. Should be used instead of the constructor.
   * @param id
   * @param employeeId
   * @param menuItemId
   * @param mealSelectionWindow
   * @param date
   * @param quantity
   * @returns Valid {@link MealSelection} instance.
   * @throws {InvalidInputDataException} if the meal selection date is outside the selection window.
   */
  public static create(
    id: string,
    employeeId: string,
    menuItemId: string,
    mealSelectionWindow: MealSelectionWindow,
    date: Date,
    quantity?: number | null,
  ) {
    const mealSelection = new MealSelection(
      id,
      employeeId,
      menuItemId,
      mealSelectionWindow.id,
      date,
      quantity,
    );

    if (!mealSelectionWindow.isDateWithinWindow(date)) {
      throw new InvalidInputDataException(
        `The meal selection date ${date.toISOString()} is outside the selection window (${mealSelectionWindow.startTime.toISOString()} - ${mealSelectionWindow.endTime.toISOString()}).`,
      );
    }

    return mealSelection;
  }
}
