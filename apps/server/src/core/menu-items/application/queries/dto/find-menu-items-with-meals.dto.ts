type MealDto = {
  name: string;
  description: string;
};

export type MenuItemWithMealDto = {
  id: string;
  day: string;
  price?: number;
  meal: MealDto;
};
