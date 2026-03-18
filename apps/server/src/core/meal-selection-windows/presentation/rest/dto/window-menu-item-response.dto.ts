import { IWindowMenuItemMeal, IWindowMenuItemResponse } from '@food-up/shared';
import { Expose, Type } from 'class-transformer';

export class WindowMenuItemMealDto implements IWindowMenuItemMeal {
  @Expose() name: string;
  @Expose() description: string;
}

export class WindowMenuItemResponseDto implements IWindowMenuItemResponse {
  @Expose() id: string;
  @Expose() day: string;
  @Expose() price?: number;

  @Expose()
  @Type(() => WindowMenuItemMealDto)
  meal: WindowMenuItemMealDto;
}
