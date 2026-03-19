import { ChangeRequestStatus, MealType } from '@food-up/shared';

export type MealSummaryDto = {
  name: string;
  type: MealType;
};

export type RichChangeRequestDto = {
  id: string;
  status: ChangeRequestStatus;
  employeeId: string;
  employeeName: string;
  mealSelectionWindowId: string;
  mealSelectionId: string | null;
  date: string | null;
  currentMeal: MealSummaryDto | null;
  requestedMeal: MealSummaryDto | null;
  clearSelection: boolean;
  newMenuItemId: string | null;
  newQuantity: number | null;
};
