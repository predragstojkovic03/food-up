import { MealType } from '../enums/meal-type.enum';

export interface IMealSelectionWindowResponse {
  id: string;
  menuPeriodIds: string[];
  startTime: string;
  endTime: string;
  targetDates: string[];
  isLocked: boolean;
}

export interface IGetCurrentMealSelectionWindowResponse {
  id: string;
  startTime: string;
  endTime: string;
  targetDates: string[];
  menuItems: ICurrentWindowMenuItem[];
}

export interface IWindowMenuItemMeal {
  name: string;
  description: string;
  type: MealType;
}

export interface ICurrentWindowMenuItem {
  id: string;
  day: string;
  price?: number;
  meal: IWindowMenuItemMeal;
}

export interface IWindowMenuItemResponse {
  id: string;
  day: string;
  price?: number;
  meal: IWindowMenuItemMeal;
}

export interface IRelevantMealSelectionWindowResponse {
  id: string;
  startTime: string;
  endTime: string;
  targetDates: string[];
  isActive: boolean;
}

export interface ICreateMealSelectionWindow {
  menuPeriodIds: string[];
  startTime: string;
  endTime: string;
  targetDates: string[];
}

export interface IUpdateMealSelectionWindow {
  menuPeriodIds?: string[];
  startTime?: string;
  endTime?: string;
  targetDates?: string[];
  isLocked?: boolean;
}
