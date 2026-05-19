import { Provider } from '@nestjs/common';
import { I_USER_PREFERENCES_REPOSITORY } from '../domain/user-preferences.repository.interface';
import { UserPreferencesTypeOrmRepository } from './persistence/user-preferences-typeorm.repository';

export const UserPreferencesRepositoryProvider: Provider = {
  provide: I_USER_PREFERENCES_REPOSITORY,
  useClass: UserPreferencesTypeOrmRepository,
};
