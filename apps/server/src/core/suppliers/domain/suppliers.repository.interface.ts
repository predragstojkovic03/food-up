import { IArchivableRepository } from 'src/shared/domain/archivable-repository.interface';
import { Supplier } from './supplier.entity';

export const I_SUPPLIERS_REPOSITORY = Symbol('ISuppliersRepository');

export interface ISuppliersRepository extends IArchivableRepository<Supplier> {}
