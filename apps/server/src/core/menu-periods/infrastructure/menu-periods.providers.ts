import { Provider } from '@nestjs/common';
import { I_MENU_PERIODS_REPOSITORY } from '../domain/menu-periods.repository.interface';
import { MenuPeriodsTypeOrmRepository } from './persistence/menu-periods-typeorm.repository';

export const MenuPeriodsRepositoryProvider: Provider = {
  provide: I_MENU_PERIODS_REPOSITORY,
  useClass: MenuPeriodsTypeOrmRepository,
};

// UseCase providers removed. Only repository provider remains.
