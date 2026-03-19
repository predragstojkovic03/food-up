import { ChangeRequestStatus, MealType } from '../enums';

export interface IUpdateChangeRequest {
  mealSelectionId: string;
  newMenuItemId?: string;
  newQuantity?: number;
  clearSelection?: boolean;
}

export interface IMealSummary {
  name: string;
  type: MealType;
}

export interface IRichChangeRequest {
  id: string;
  status: ChangeRequestStatus;
  employeeId: string;
  employeeName: string;
  mealSelectionWindowId: string;
  mealSelectionId: string | null;
  date: string | null;
  currentMeal: IMealSummary | null;
  requestedMeal: IMealSummary | null;
  clearSelection: boolean;
  newMenuItemId: string | null;
  newQuantity: number | null;
}

export interface ICreateChangeRequest {
  mealSelectionWindowId: string;
  mealSelectionId?: string;
  newMenuItemId?: string;
  newQuantity?: number;
  clearSelection?: boolean;
}

export interface IBulkUpdateChangeRequestStatusItem {
  id: string;
  status: ChangeRequestStatus;
}

export interface IBulkUpdateChangeRequestStatus {
  items: IBulkUpdateChangeRequestStatusItem[];
}
