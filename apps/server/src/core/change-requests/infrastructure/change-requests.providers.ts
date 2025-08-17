import { Provider } from '@nestjs/common';
import { I_CHANGE_REQUESTS_REPOSITORY } from '../domain/change-requests.repository.interface';
import { ChangeRequestsTypeOrmRepository } from './persistence/change-requests-typeorm.repository';

export const ChangeRequestsRepositoryProvide: Provider = {
  provide: I_CHANGE_REQUESTS_REPOSITORY,
  useClass: ChangeRequestsTypeOrmRepository,
};

// UseCase providers removed. Only repository provider remains.
