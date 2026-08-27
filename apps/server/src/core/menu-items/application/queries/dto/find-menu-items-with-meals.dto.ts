import { DietaryTag, MealType } from '@food-up/shared';

type MealDto = {
  name: string;
  description?: string;
  type: MealType;
  dietaryTags: DietaryTag[];
};

export type MenuItemWithMealDto = {
  id: string;
  day: string;
  price?: number;
  supplierId: string;
  supplierName: string;
  meal: MealDto;
};
