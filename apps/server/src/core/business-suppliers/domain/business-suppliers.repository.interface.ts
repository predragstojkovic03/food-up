import { IRepository } from 'src/shared/domain/repository.interface';
import { BusinessSupplier } from './business-supplier.entity';

export const I_BUSINESS_SUPPLIERS_REPOSITORY = Symbol(
  'IBusinessSuppliersRepository',
);

export interface IBusinessSuppliersRepository
  extends IRepository<BusinessSupplier> {}
