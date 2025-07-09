import { Provider } from '@nestjs/common';
import { CreateChangeRequestUseCase } from '../application/use-cases/create-change-request.use-case';
import { DeleteChangeRequestUseCase } from '../application/use-cases/delete-change-request.use-case';
import { FindAllChangeRequestsUseCase } from '../application/use-cases/find-all-change-requests.use-case';
import { FindChangeRequestUseCase } from '../application/use-cases/find-change-request.use-case';
import { UpdateChangeRequestUseCase } from '../application/use-cases/update-change-request.use-case';
import { I_CHANGE_REQUESTS_REPOSITORY } from '../domain/change-requests.repository.interface';
import { ChangeRequestsTypeOrmRepository } from './persistence/change-requests-typeorm.repository';

export const ChangeRequestsRepositoryProvide: Provider = {
  provide: I_CHANGE_REQUESTS_REPOSITORY,
  useClass: ChangeRequestsTypeOrmRepository,
};

export const ChangeRequestsUseCaseProviders: Provider[] = [
  {
    provide: CreateChangeRequestUseCase,
    useFactory: (repo) => new CreateChangeRequestUseCase(repo),
    inject: [I_CHANGE_REQUESTS_REPOSITORY],
  },
  {
    provide: FindAllChangeRequestsUseCase,
    useFactory: (repo) => new FindAllChangeRequestsUseCase(repo),
    inject: [I_CHANGE_REQUESTS_REPOSITORY],
  },
  {
    provide: FindChangeRequestUseCase,
    useFactory: (repo) => new FindChangeRequestUseCase(repo),
    inject: [I_CHANGE_REQUESTS_REPOSITORY],
  },
  {
    provide: UpdateChangeRequestUseCase,
    useFactory: (repo) => new UpdateChangeRequestUseCase(repo),
    inject: [I_CHANGE_REQUESTS_REPOSITORY],
  },
  {
    provide: DeleteChangeRequestUseCase,
    useFactory: (repo) => new DeleteChangeRequestUseCase(repo),
    inject: [I_CHANGE_REQUESTS_REPOSITORY],
  },
];
