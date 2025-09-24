import { IRepository } from 'src/shared/domain/repository.interface';
import { MealSelectionWindow } from './meal-selection-window.entity';

export const I_MEAL_SELECTION_WINDOWS_REPOSITORY = Symbol(
  'IMealSelectionWindowsRepository',
);

export interface IMealSelectionWindowsRepository
  extends IRepository<MealSelectionWindow> {
  findLatestActiveByBusiness(businessId: string): Promise<MealSelectionWindow>;
}
