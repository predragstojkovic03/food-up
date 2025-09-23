export type UpdateChangeRequestDto = {
  mealSelectionId: string;
  newMenuItemId?: string;
  newQuantity?: number;
  clearSelection?: boolean;
};
