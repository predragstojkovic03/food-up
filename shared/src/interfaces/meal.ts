// Shared interfaces for Meal DTOs

export interface ICreateMeal {
  name: string;
  description: string;
  type: string;
  price?: number;
  supplierId?: string;
}

export interface IUpdateMeal extends Partial<ICreateMeal> {}

export interface IMealResponse {
  id: string;
  name: string;
  description: string;
  type: string;
}
