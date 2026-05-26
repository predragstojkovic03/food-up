import { MealType } from '@food-up/shared';
import { Expose, Type } from 'class-transformer';

export class WindowDailyOverviewMealResponseDto {
  @Expose()
  name: string;

  @Expose()
  type: MealType;
}

export class WindowDailyOverviewResponseDto {
  @Expose()
  employeeId: string;

  @Expose()
  employeeName: string;

  @Expose()
  date: string;

  @Expose()
  status: 'ordered' | 'skipped' | 'no_record';

  @Expose()
  @Type(() => WindowDailyOverviewMealResponseDto)
  meals: WindowDailyOverviewMealResponseDto[];
}
