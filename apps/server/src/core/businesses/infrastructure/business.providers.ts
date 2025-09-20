import { Provider } from '@nestjs/common';

import { I_BUSINESSES_REPOSITORY } from '../domain/businesses.repository.interface';
import { BusinessTypeormRepository } from './persistence/business-typeorm.repository';

export const BusinessRepositoryProvider: Provider = {
  provide: I_BUSINESSES_REPOSITORY,
  useClass: BusinessTypeormRepository,
};
