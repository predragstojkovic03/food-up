import { IRepository } from 'src/shared/domain/repository.interface';
import { Supplier } from './supplier.entity';

export const I_SUPPLIERS_REPOSITORY = Symbol('ISuppliersRepository');

export interface ISuppliersRepository extends IRepository<Supplier> {}
