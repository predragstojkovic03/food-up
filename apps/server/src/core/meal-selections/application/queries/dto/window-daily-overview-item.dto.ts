import { MealType } from '@food-up/shared';

export type WindowDailyOverviewMealDto = {
  menuItemId: string;
  name: string;
  type: MealType;
  quantity: number;
};

export type WindowDailyOverviewChangeDto = {
  type: MealType;
  kind: 'swap' | 'removal' | 'addition';
  from: string | null;
  to: string | null;
  approvedAt: string | null;
};

export type WindowDailyOverviewItemDto = {
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'ordered' | 'skipped' | 'no_record';
  meals: WindowDailyOverviewMealDto[];
  changes: WindowDailyOverviewChangeDto[];
};
