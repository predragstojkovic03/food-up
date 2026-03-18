export interface IMealSelectionResponse {
  id: string;
  employeeId: string;
  menuItemId: string;
  mealSelectionWindowId: string;
  date: string;
  quantity?: number | null;
}

export interface ICreateMealSelection {
  menuItemId: string;
  mealSelectionWindowId: string;
  quantity?: number;
}

export interface IUpdateMealSelection {
  menuItemId?: string;
  quantity?: number | null;
}
