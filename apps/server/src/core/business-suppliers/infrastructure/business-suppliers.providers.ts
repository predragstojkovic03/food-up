import { Provider } from '@nestjs/common';
import { FindSupplierUseCase } from 'src/core/suppliers/application/use-cases/find-supplier.use-case';
import { CreateBusinessSupplierUseCase } from '../application/use-cases/create-business-supplier.use-case';
import { DeleteBusinessSupplierUseCase } from '../application/use-cases/delete-business-supplier.use-case';
import { FindAllBusinessSuppliersUseCase } from '../application/use-cases/find-all-business-suppliers.use-case';
import { FindBusinessSupplierUseCase } from '../application/use-cases/find-business-supplier.use-case';
import { UpdateBusinessSupplierUseCase } from '../application/use-cases/update-business-supplier.use-case';
import {
  I_BUSINESS_SUPPLIERS_REPOSITORY,
  IBusinessSuppliersRepository,
} from '../domain/business-suppliers.repository.interface';
import { BusinessSuppliersTypeOrmRepository } from './persistence/business-suppliers-typeorm.repository';

export const BusinessSuppliersRepositoryProvider: Provider = {
  provide: I_BUSINESS_SUPPLIERS_REPOSITORY,
  useClass: BusinessSuppliersTypeOrmRepository,
};

export const BusinessSuppliersUseCaseProviders: Provider[] = [
  {
    provide: CreateBusinessSupplierUseCase,
    useFactory: (
      repo: IBusinessSuppliersRepository,
      findSupplierUseCase: FindSupplierUseCase,
    ) => new CreateBusinessSupplierUseCase(repo, findSupplierUseCase),
    inject: [I_BUSINESS_SUPPLIERS_REPOSITORY, FindSupplierUseCase],
  },
  {
    provide: FindAllBusinessSuppliersUseCase,
    useFactory: (repo: IBusinessSuppliersRepository) =>
      new FindAllBusinessSuppliersUseCase(repo),
    inject: [I_BUSINESS_SUPPLIERS_REPOSITORY],
  },
  {
    provide: FindBusinessSupplierUseCase,
    useFactory: (repo: IBusinessSuppliersRepository) =>
      new FindBusinessSupplierUseCase(repo),
    inject: [I_BUSINESS_SUPPLIERS_REPOSITORY],
  },
  {
    provide: UpdateBusinessSupplierUseCase,
    useFactory: (repo: IBusinessSuppliersRepository) =>
      new UpdateBusinessSupplierUseCase(repo),
    inject: [I_BUSINESS_SUPPLIERS_REPOSITORY],
  },
  {
    provide: DeleteBusinessSupplierUseCase,
    useFactory: (repo: IBusinessSuppliersRepository) =>
      new DeleteBusinessSupplierUseCase(repo),
    inject: [I_BUSINESS_SUPPLIERS_REPOSITORY],
  },
];
