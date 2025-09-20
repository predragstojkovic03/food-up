import { Provider } from '@nestjs/common';

import { I_MEAL_SELECTION_WINDOWS_REPOSITORY } from '../domain/meal-selection-windows.repository.interface';
import { MealSelectionWindowsTypeOrmRepository } from './persistence/meal-selection-windows-typeorm.repository';

export const MealSelectionWindowsRepositoryProvider: Provider = {
  provide: I_MEAL_SELECTION_WINDOWS_REPOSITORY,
  useClass: MealSelectionWindowsTypeOrmRepository,
};
