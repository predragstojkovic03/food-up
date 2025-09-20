import { Provider } from '@nestjs/common';
import { I_SUPPLIERS_REPOSITORY } from '../domain/suppliers.repository.interface';
import { SuppliersTypeOrmRepository } from './persistence/suppliers-typeorm.repository';

export const SuppliersRepositoryProvider: Provider = {
  provide: I_SUPPLIERS_REPOSITORY,
  useClass: SuppliersTypeOrmRepository,
};
