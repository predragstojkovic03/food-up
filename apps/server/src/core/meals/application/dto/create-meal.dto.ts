import { DietaryTag, MealType } from '@food-up/shared';

export interface CreateMealDto {
  name: string;
  description?: string;
  type: MealType;
  price?: number;
  /** Required for employees; supplier accounts create meals for themselves. */
  supplierId?: string;
  dietaryTags?: DietaryTag[];
}

/** A meal can't be moved to another supplier, so supplierId isn't updatable. */
export type UpdateMealDto = Partial<Omit<CreateMealDto, 'supplierId'>>;
