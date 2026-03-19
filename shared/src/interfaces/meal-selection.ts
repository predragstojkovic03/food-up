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
