import { Provider } from '@nestjs/common';
import { I_BUSINESS_INVITES_REPOSITORY } from '../domain/business-invites.repository.interface';
import { BusinessInvitesTypeOrmRepository } from './persistence/business-invites-typeorm.repository';

export const BusinessInvitesRepositoryProvider: Provider = {
  provide: I_BUSINESS_INVITES_REPOSITORY,
  useClass: BusinessInvitesTypeOrmRepository,
};
