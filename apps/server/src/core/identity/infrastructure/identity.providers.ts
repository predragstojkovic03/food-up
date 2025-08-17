import { Provider } from '@nestjs/common';
import { I_IDENTITY_REPOSITORY } from '../domain/identity.repository.interface';
import { IdentityTypeOrmRepository } from './persistence/identity-typeorm.repository';

export const IdentityRepositoryProvider: Provider = {
  provide: I_IDENTITY_REPOSITORY,
  useClass: IdentityTypeOrmRepository,
};
