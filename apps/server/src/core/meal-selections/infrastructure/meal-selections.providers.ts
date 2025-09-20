import { Provider } from '@nestjs/common';

import { I_MEAL_SELECTIONS_REPOSITORY } from '../domain/meal-selections.repository.interface';
import { MealSelectionsTypeOrmRepository } from './persistence/meal-selections-typeorm.repository';

export const MealSelectionsRepositoryProvide: Provider = {
  provide: I_MEAL_SELECTIONS_REPOSITORY,
  useClass: MealSelectionsTypeOrmRepository,
};
