import { IRepository } from 'src/shared/domain/repository.interface';
import { BusinessInvite } from './business-invite.entity';

export const I_BUSINESS_INVITES_REPOSITORY = Symbol('I_BUSINESS_INVITES_REPOSITORY');

export interface IBusinessInvitesRepository extends IRepository<BusinessInvite> {}
