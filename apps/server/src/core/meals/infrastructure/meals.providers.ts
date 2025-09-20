import { Provider } from '@nestjs/common';

import { I_MEALS_REPOSITORY } from '../domain/meals.repository.interface';
import { MealsTypeOrmRepository } from './persistence/meals-typeorm.repository';

export const MealsRepositoryProvider: Provider = {
  provide: I_MEALS_REPOSITORY,
  useClass: MealsTypeOrmRepository,
};
