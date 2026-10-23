import { MealType } from '@food-up/shared';
import { Expose, Type } from 'class-transformer';

export class WindowDailyOverviewMealResponseDto {
  @Expose()
  menuItemId: string;

  @Expose()
  name: string;

  @Expose()
  type: MealType;

  @Expose()
  quantity: number;
}

export class WindowDailyOverviewChangeResponseDto {
  @Expose()
  type: MealType;

  @Expose()
  kind: 'swap' | 'removal' | 'addition';

  @Expose()
  from: string | null;

  @Expose()
  to: string | null;

  @Expose()
  approvedAt: string | null;
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

  @Expose()
  @Type(() => WindowDailyOverviewChangeResponseDto)
  changes: WindowDailyOverviewChangeResponseDto[];
}
