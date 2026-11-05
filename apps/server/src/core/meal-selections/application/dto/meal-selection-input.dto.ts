export interface CreateMealSelectionDto {
  mealSelectionWindowId: string;
  date: string;
  /** Omit to record a skip for this day. */
  menuItemId?: string;
  quantity?: number;
}

export interface UpdateMealSelectionDto {
  /** null records a skip. */
  menuItemId?: string | null;
  quantity?: number | null;
}
