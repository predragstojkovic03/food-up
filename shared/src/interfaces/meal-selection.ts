import { MealType } from '../enums/meal-type.enum';

export interface IMealSelectionResponse {
  id: string;
  employeeId: string;
  menuItemId: string | null;
  mealSelectionWindowId: string;
  date: string;
  quantity?: number | null;
}

export interface IMyMealSelectionMeal {
  name: string;
  type: MealType;
}

export interface IMyMealSelectionResponse {
  id: string;
  date: string;
  mealSelectionWindowId: string;
  menuItemId: string | null;
  quantity?: number | null;
  meal: IMyMealSelectionMeal | null;
}

export interface ICreateMealSelection {
  menuItemId?: string;
  mealSelectionWindowId: string;
  date: string;
  quantity?: number;
}

export interface IUpdateMealSelection {
  menuItemId?: string | null;
  quantity?: number | null;
}

/** Effective meal for an employee on a day, with approved change requests applied */
export interface IWindowDailyOverviewMeal {
  menuItemId: string;
  name: string;
  type: MealType;
  quantity: number;
}

/** One approved change request, in the order it was approved */
export interface IWindowDailyOverviewChange {
  type: MealType;
  kind: 'swap' | 'removal' | 'addition';
  from: string | null;
  to: string | null;
  approvedAt: string | null;
}

export interface IWindowDailyOverviewItem {
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'ordered' | 'skipped' | 'no_record';
  meals: IWindowDailyOverviewMeal[];
  changes: IWindowDailyOverviewChange[];
}
