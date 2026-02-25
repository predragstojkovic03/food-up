// Shared interfaces for Menu Item DTOs

export interface ICreateMenuItem {
  price?: number | null;
  menuPeriodId: string;
  day: string;
  mealId: string;
}

export interface IUpdateMenuItem {
  price?: number | null;
  menuPeriodId?: string;
  day?: string;
  mealId?: string;
}

export interface IMenuItemResponse {
  id: string;
  price: number | null;
  menuPeriodId: string;
  day: string;
  mealId: string;
}
