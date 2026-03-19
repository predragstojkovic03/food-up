import { MealType } from '@food-up/shared';
import { IRepository } from 'src/shared/domain/repository.interface';
import { MealSelection } from './meal-selection.entity';

export const I_MEAL_SELECTIONS_REPOSITORY = Symbol('IMealSelectionsRepository');

export interface RichMealSelection {
  id: string;
  date: string;
  mealSelectionWindowId: string;
  menuItemId: string | null;
  quantity: number | null;
  meal: { name: string; type: MealType } | null;
}

export interface IMealSelectionsRepository extends IRepository<MealSelection> {
  findByWindow(windowId: string): Promise<MealSelection[]>;
  findAllByEmployeeAndWindow(
    employeeId: string,
    windowId: string,
  ): Promise<MealSelection[]>;
  findRichByEmployeeAndWindow(
    employeeId: string,
    windowId: string,
  ): Promise<RichMealSelection[]>;
}
