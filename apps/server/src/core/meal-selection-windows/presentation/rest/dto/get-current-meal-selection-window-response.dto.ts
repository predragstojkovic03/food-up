import { ICurrentWindowMenuItem, IGetCurrentMealSelectionWindowResponse, MealType } from '@food-up/shared';
import { Expose, Type } from 'class-transformer';

export class MealDto {
  @Expose() name: string;
  @Expose() description: string;
  @Expose() type: MealType;
}

export class MenuItem implements ICurrentWindowMenuItem {
  @Expose() id: string;
  @Expose() day: string;
  @Expose() price?: number;

  @Expose()
  @Type(() => MealDto)
  meal: MealDto;
}

export class GetCurrentMealSelectionWindowResponseDto implements IGetCurrentMealSelectionWindowResponse {
  @Expose()
  id: string;

  @Expose()
  startTime: string;

  @Expose()
  endTime: string;

  @Expose()
  targetDates: string[];

  @Expose()
  @Type(() => MenuItem)
  menuItems: MenuItem[];
}
