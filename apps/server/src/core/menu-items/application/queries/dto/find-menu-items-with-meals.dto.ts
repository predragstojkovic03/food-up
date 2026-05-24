import { MealType } from '@food-up/shared';

type MealDto = {
  name: string;
  description: string;
  type: MealType;
};

export type MenuItemWithMealDto = {
  id: string;
  day: string;
  price?: number;
  supplierId: string;
  supplierName: string;
  meal: MealDto;
};
