import { Provider } from '@nestjs/common';
import { CreateSupplierUseCase } from '../application/use-cases/create-supplier.use-case';
import { DeleteSupplierUseCase } from '../application/use-cases/delete-supplier.use-case';
import { FindAllSuppliersUseCase } from '../application/use-cases/find-all-suppliers.use-case';
import { FindSupplierUseCase } from '../application/use-cases/find-supplier.use-case';
import { UpdateSupplierUseCase } from '../application/use-cases/update-supplier.use-case';
import { I_SUPPLIERS_REPOSITORY } from '../domain/suppliers.repository.interface';
import { SuppliersTypeOrmRepository } from './persistence/suppliers-typeorm.repository';

export const SuppliersRepositoryProvider: Provider = {
  provide: I_SUPPLIERS_REPOSITORY,
  useClass: SuppliersTypeOrmRepository,
};

export const SuppliersUseCaseProviders: Provider[] = [
  {
    provide: CreateSupplierUseCase,
    useFactory: (repo) => new CreateSupplierUseCase(repo),
    inject: [I_SUPPLIERS_REPOSITORY],
  },
  {
    provide: FindAllSuppliersUseCase,
    useFactory: (repo) => new FindAllSuppliersUseCase(repo),
    inject: [I_SUPPLIERS_REPOSITORY],
  },
  {
    provide: FindSupplierUseCase,
    useFactory: (repo) => new FindSupplierUseCase(repo),
    inject: [I_SUPPLIERS_REPOSITORY],
  },
  {
    provide: UpdateSupplierUseCase,
    useFactory: (repo) => new UpdateSupplierUseCase(repo),
    inject: [I_SUPPLIERS_REPOSITORY],
  },
  {
    provide: DeleteSupplierUseCase,
    useFactory: (repo) => new DeleteSupplierUseCase(repo),
    inject: [I_SUPPLIERS_REPOSITORY],
  },
];
