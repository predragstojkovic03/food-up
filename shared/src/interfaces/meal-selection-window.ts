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
