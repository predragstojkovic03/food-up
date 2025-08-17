import { Provider } from '@nestjs/common';
import { I_BUSINESS_SUPPLIERS_REPOSITORY } from '../domain/business-suppliers.repository.interface';
import { BusinessSuppliersTypeOrmRepository } from './persistence/business-suppliers-typeorm.repository';

export const BusinessSuppliersRepositoryProvider: Provider = {
  provide: I_BUSINESS_SUPPLIERS_REPOSITORY,
  useClass: BusinessSuppliersTypeOrmRepository,
};

// UseCase providers removed. Only repository provider remains.
