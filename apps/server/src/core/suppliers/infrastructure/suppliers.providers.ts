import { Provider } from '@nestjs/common';
import { FindBusinessUseCase } from 'src/core/businesses/application/use-cases/find-business.use-case';
import { CreateSupplierUseCase } from '../application/use-cases/create-supplier.use-case';
import { DeleteSupplierUseCase } from '../application/use-cases/delete-supplier.use-case';
import { FindAllSuppliersUseCase } from '../application/use-cases/find-all-suppliers.use-case';
import { FindSupplierUseCase } from '../application/use-cases/find-supplier.use-case';
import { UpdateSupplierUseCase } from '../application/use-cases/update-supplier.use-case';
import {
  I_SUPPLIERS_REPOSITORY,
  ISuppliersRepository,
} from '../domain/suppliers.repository.interface';
import { SuppliersTypeOrmRepository } from './persistence/suppliers-typeorm.repository';

export const SuppliersRepositoryProvider: Provider = {
  provide: I_SUPPLIERS_REPOSITORY,
  useClass: SuppliersTypeOrmRepository,
};

export const SuppliersUseCaseProviders: Provider[] = [
  {
    provide: CreateSupplierUseCase,
    useFactory: (
      repo: ISuppliersRepository,
      findBusiness: FindBusinessUseCase,
    ) => new CreateSupplierUseCase(repo, findBusiness),
    inject: [I_SUPPLIERS_REPOSITORY, FindBusinessUseCase],
  },
  {
    provide: FindAllSuppliersUseCase,
    useFactory: (repo: ISuppliersRepository) =>
      new FindAllSuppliersUseCase(repo),
    inject: [I_SUPPLIERS_REPOSITORY],
  },
  {
    provide: FindSupplierUseCase,
    useFactory: (repo: ISuppliersRepository) => new FindSupplierUseCase(repo),
    inject: [I_SUPPLIERS_REPOSITORY],
  },
  {
    provide: UpdateSupplierUseCase,
    useFactory: (
      repo: ISuppliersRepository,
      findBusiness: FindBusinessUseCase,
    ) => new UpdateSupplierUseCase(repo, findBusiness),
    inject: [I_SUPPLIERS_REPOSITORY, FindBusinessUseCase],
  },
  {
    provide: DeleteSupplierUseCase,
    useFactory: (repo) => new DeleteSupplierUseCase(repo),
    inject: [I_SUPPLIERS_REPOSITORY],
  },
];
