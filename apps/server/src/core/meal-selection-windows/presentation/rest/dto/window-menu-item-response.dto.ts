import { DietaryTag, IWindowMenuItemMeal, IWindowMenuItemResponse, MealType } from '@food-up/shared';
import { Expose, Type } from 'class-transformer';

export class WindowMenuItemMealDto implements IWindowMenuItemMeal {
  @Expose() name: string;
  @Expose() description: string;
  @Expose() type: MealType;
  @Expose() dietaryTags: DietaryTag[];
}

export class WindowMenuItemResponseDto implements IWindowMenuItemResponse {
  @Expose() id: string;
  @Expose() day: string;
  @Expose() price?: number;
  @Expose() supplierId: string;
  @Expose() supplierName: string;

  @Expose()
  @Type(() => WindowMenuItemMealDto)
  meal: WindowMenuItemMealDto;
}
