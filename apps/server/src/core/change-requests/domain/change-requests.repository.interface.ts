import { IRepository } from 'src/shared/domain/repository.interface';
import { ChangeRequest } from './change-request.entity';

export const I_CHANGE_REQUESTS_REPOSITORY = Symbol('IChangeRequestsRepository');

export interface IChangeRequestsRepository extends IRepository<ChangeRequest> {}
