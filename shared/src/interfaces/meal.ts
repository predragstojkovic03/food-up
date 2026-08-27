import { DietaryTag } from '../enums/dietary-tag.enum';
import { MealType } from '../enums/meal-type.enum';

export interface ICreateMeal {
  name: string;
  description?: string;
  type: MealType;
  price?: number;
  supplierId?: string;
  dietaryTags?: DietaryTag[];
}

export interface IUpdateMeal extends Partial<ICreateMeal> {}

export interface IMealResponse {
  id: string;
  name: string;
  description?: string;
  type: MealType;
  price?: number;
  dietaryTags: DietaryTag[];
}
