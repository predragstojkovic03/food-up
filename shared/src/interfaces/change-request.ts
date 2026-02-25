// Shared interfaces for Change Request DTOs

export interface IUpdateChangeRequest {
  mealSelectionId: string;
  newMenuItemId?: string;
  newQuantity?: number;
  clearSelection?: boolean;
}
