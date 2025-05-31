import { Provider } from '@nestjs/common';
import { CreateBusinessUseCase } from '../application/use-cases/create-business.use-case';
import { I_BUSINESSES_REPOSITORY } from '../domain/businesses.repository';
import { BusinessTypeormRepository } from './persistence/business-typeorm.repository';

export const BusinessRepositoryProvider: Provider = {
  provide: I_BUSINESSES_REPOSITORY,
  useClass: BusinessTypeormRepository,
};

export const BusinessUseCases: Array<Provider> = [
  {
    provide: CreateBusinessUseCase,
    useFactory: (repository) => new CreateBusinessUseCase(repository),
    inject: [I_BUSINESSES_REPOSITORY],
  },
];
