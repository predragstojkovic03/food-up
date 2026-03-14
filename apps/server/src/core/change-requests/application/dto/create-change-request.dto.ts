export type CreateChangeRequestDto = {
  mealSelectionWindowId: string;
  mealSelectionId?: string;
  newMenuItemId?: string;
  newQuantity?: number;
  clearSelection?: boolean;
};
