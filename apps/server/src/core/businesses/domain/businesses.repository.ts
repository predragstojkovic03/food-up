import { IRepository } from 'src/shared/domain/repository.interface';
import { Business } from './business.entity';

export const I_BUSINESSES_REPOSITORY = Symbol('IBusinessesRepository');

export interface IBusinessesRepository extends IRepository<Business> {}
