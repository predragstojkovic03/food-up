import { Expose, Type } from 'class-transformer';

export class MealDto {
  @Expose() name: string;
  @Expose() description: string;
}

export class MenuItem {
  @Expose() id: string;
  @Expose() day: string;
  @Expose() price?: number;

  @Expose()
  @Type(() => MealDto)
  meal: MealDto;
}

export class GetCurrentMealSelectionWindowResponseDto {
  @Expose()
  id: string;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  @Type(() => MenuItem)
  menuItems: MenuItem[];
}
