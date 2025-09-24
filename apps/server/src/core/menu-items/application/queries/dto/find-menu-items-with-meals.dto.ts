type MealDto = {
  name: string;
  description: string;
};

type MenuItemWithMealDto = {
  id: string;
  day: string;
  price?: number;
  meal: MealDto;
};
