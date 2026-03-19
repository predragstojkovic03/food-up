import { IWindowMenuItemMeal, IWindowMenuItemResponse, MealType } from '@food-up/shared';
import { Expose, Type } from 'class-transformer';

export class WindowMenuItemMealDto implements IWindowMenuItemMeal {
  @Expose() name: string;
  @Expose() description: string;
  @Expose() type: MealType;
}

export class WindowMenuItemResponseDto implements IWindowMenuItemResponse {
  @Expose() id: string;
  @Expose() day: string;
  @Expose() price?: number;

  @Expose()
  @Type(() => WindowMenuItemMealDto)
  meal: WindowMenuItemMealDto;
}
