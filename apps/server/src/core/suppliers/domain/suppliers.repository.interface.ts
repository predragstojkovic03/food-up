import { IArchivableRepository } from 'src/shared/domain/archivable-repository.interface';
import { Supplier } from './supplier.entity';

export const I_SUPPLIERS_REPOSITORY = Symbol('ISuppliersRepository');

export interface ISuppliersRepository extends IArchivableRepository<Supplier> {
  findManagedByBusiness(businessId: string): Promise<Supplier[]>;
  findPartnersByBusiness(businessId: string): Promise<Supplier[]>;
}
