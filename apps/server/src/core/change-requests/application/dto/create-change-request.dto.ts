export type CreateChangeRequestDto = {
  mealSelectionId: string;
  newMenuItemId?: string;
  newQuantity?: number;
  clearSelection?: boolean;
};
