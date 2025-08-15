import { Provider } from '@nestjs/common';
import { CreateIdentityUseCase } from '../application/use-cases/create-identity.use-case';
import { DeleteIdentityUseCase } from '../application/use-cases/delete-identity.use-case';
import { FindIdentityUseCase } from '../application/use-cases/find-identity.use-case';
import { UpdateIdentityUseCase } from '../application/use-cases/update-identity.use-case';
import { ValidateCredentialsUseCase } from '../application/use-cases/validate-credentials.use-case';
import {
  I_IDENTITY_REPOSITORY,
  IIdentityRepository,
} from '../domain/identity.repository.interface';
import { IdentityTypeOrmRepository } from './persistence/identity-typeorm.repository';

export const IdentityRepositoryProvider: Provider = {
  provide: I_IDENTITY_REPOSITORY,
  useClass: IdentityTypeOrmRepository,
};

export const IdentityUseCaseProviders: Provider[] = [
  {
    provide: CreateIdentityUseCase,
    useFactory: (repo: IIdentityRepository) => new CreateIdentityUseCase(repo),
    inject: [I_IDENTITY_REPOSITORY],
  },
  {
    provide: FindIdentityUseCase,
    useFactory: (repo: IIdentityRepository) => new FindIdentityUseCase(repo),
    inject: [I_IDENTITY_REPOSITORY],
  },
  {
    provide: UpdateIdentityUseCase,
    useFactory: (repo: IIdentityRepository) => new UpdateIdentityUseCase(repo),
    inject: [I_IDENTITY_REPOSITORY],
  },
  {
    provide: DeleteIdentityUseCase,
    useFactory: (repo: IIdentityRepository) => new DeleteIdentityUseCase(repo),
    inject: [I_IDENTITY_REPOSITORY],
  },
  {
    provide: ValidateCredentialsUseCase,
    useFactory: (repo: IIdentityRepository) =>
      new ValidateCredentialsUseCase(repo),
    inject: [I_IDENTITY_REPOSITORY],
  },
];
