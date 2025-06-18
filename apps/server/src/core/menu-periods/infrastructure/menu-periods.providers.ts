import { Provider } from '@nestjs/common';
import { CreateMenuPeriodUseCase } from '../application/use-cases/create-menu-period.use-case';
import { DeleteMenuPeriodUseCase } from '../application/use-cases/delete-menu-period.use-case';
import { FindAllMenuPeriodsUseCase } from '../application/use-cases/find-all-menu-periods.use-case';
import { FindMenuPeriodUseCase } from '../application/use-cases/find-menu-period.use-case';
import { UpdateMenuPeriodUseCase } from '../application/use-cases/update-menu-period.use-case';
import { I_MENU_PERIODS_REPOSITORY } from '../domain/menu-periods.repository.interface';
import { MenuPeriodsTypeOrmRepository } from './persistence/menu-periods-typeorm.repository';

export const MenuPeriodsRepositoryProvider: Provider = {
  provide: I_MENU_PERIODS_REPOSITORY,
  useClass: MenuPeriodsTypeOrmRepository,
};

export const MenuPeriodsUseCaseProviders: Provider[] = [
  {
    provide: CreateMenuPeriodUseCase,
    useFactory: (repo) => new CreateMenuPeriodUseCase(repo),
    inject: [I_MENU_PERIODS_REPOSITORY],
  },
  {
    provide: FindAllMenuPeriodsUseCase,
    useFactory: (repo) => new FindAllMenuPeriodsUseCase(repo),
    inject: [I_MENU_PERIODS_REPOSITORY],
  },
  {
    provide: FindMenuPeriodUseCase,
    useFactory: (repo) => new FindMenuPeriodUseCase(repo),
    inject: [I_MENU_PERIODS_REPOSITORY],
  },
  {
    provide: UpdateMenuPeriodUseCase,
    useFactory: (repo) => new UpdateMenuPeriodUseCase(repo),
    inject: [I_MENU_PERIODS_REPOSITORY],
  },
  {
    provide: DeleteMenuPeriodUseCase,
    useFactory: (repo) => new DeleteMenuPeriodUseCase(repo),
    inject: [I_MENU_PERIODS_REPOSITORY],
  },
];
