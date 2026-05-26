import { MealType } from '@food-up/shared';

export type WindowDailyOverviewItemDto = {
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'ordered' | 'skipped' | 'no_record';
  meals: Array<{ name: string; type: MealType }>;
};
