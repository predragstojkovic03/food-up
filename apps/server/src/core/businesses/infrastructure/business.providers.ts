import { Provider } from '@nestjs/common';
import { FindBusinessesBulkUseCase } from 'src/core/business-suppliers/application/use-cases/find-businesses-bulk.use-case';
import { CreateBusinessUseCase } from '../application/use-cases/create-business.use-case';
import { DeleteBusinessUseCase } from '../application/use-cases/delete-business.use-case';
import { FindAllBusinessesUseCase } from '../application/use-cases/find-all-businesses.use-case';
import { FindBusinessUseCase } from '../application/use-cases/find-business.use-case';
import { UpdateBusinessUseCase } from '../application/use-cases/update-business.use-case';
import {
  I_BUSINESSES_REPOSITORY,
  IBusinessesRepository,
} from '../domain/businesses.repository.interface';
import { BusinessTypeormRepository } from './persistence/business-typeorm.repository';

export const BusinessRepositoryProvider: Provider = {
  provide: I_BUSINESSES_REPOSITORY,
  useClass: BusinessTypeormRepository,
};

export const BusinessUseCases: Array<Provider> = [
  {
    provide: CreateBusinessUseCase,
    useFactory: (repository: IBusinessesRepository) =>
      new CreateBusinessUseCase(repository),
    inject: [I_BUSINESSES_REPOSITORY],
  },
  {
    provide: FindAllBusinessesUseCase,
    useFactory: (repository: IBusinessesRepository) =>
      new FindAllBusinessesUseCase(repository),
    inject: [I_BUSINESSES_REPOSITORY],
  },
  {
    provide: FindBusinessUseCase,
    useFactory: (repository: IBusinessesRepository) =>
      new FindBusinessUseCase(repository),
    inject: [I_BUSINESSES_REPOSITORY],
  },
  {
    provide: DeleteBusinessUseCase,
    useFactory: (repository: IBusinessesRepository) =>
      new DeleteBusinessUseCase(repository),
    inject: [I_BUSINESSES_REPOSITORY],
  },
  {
    provide: UpdateBusinessUseCase,
    useFactory: (repository: IBusinessesRepository) =>
      new UpdateBusinessUseCase(repository),
    inject: [I_BUSINESSES_REPOSITORY],
  },
  {
    provide: FindBusinessesBulkUseCase,
    useFactory: (repository: IBusinessesRepository) =>
      new FindBusinessesBulkUseCase(repository),
    inject: [I_BUSINESSES_REPOSITORY],
  },
];
