import { Provider } from '@nestjs/common';
import { FindMealUseCase } from 'src/core/meals/application/find-meal.use-case';
import { CreateMenuItemUseCase } from '../application/use-cases/create-menu-item.use-case';
import { DeleteMenuItemUseCase } from '../application/use-cases/delete-menu-item.use-case';
import { FindAllMenuItemsUseCase } from '../application/use-cases/find-all-menu-items.use-case';
import { FindMenuItemUseCase } from '../application/use-cases/find-menu-item.use-case';
import { UpdateMenuItemUseCase } from '../application/use-cases/update-menu-item.use-case';
import {
  I_MENU_ITEMS_REPOSITORY,
  IMenuItemsRepository,
} from '../domain/menu-items.repository.interface';
import { MenuItemsTypeOrmRepository } from './persistence/menu-items-typeorm.repository';

export const MenuItemsRepositoryProvide: Provider = {
  provide: I_MENU_ITEMS_REPOSITORY,
  useClass: MenuItemsTypeOrmRepository,
};

export const MenuItemsUseCaseProviders: Provider[] = [
  {
    provide: CreateMenuItemUseCase,
    useFactory: (
      repo: IMenuItemsRepository,
      findMealUseCase: FindMealUseCase,
    ) => new CreateMenuItemUseCase(repo, findMealUseCase),
    inject: [I_MENU_ITEMS_REPOSITORY, FindMealUseCase],
  },
  {
    provide: FindAllMenuItemsUseCase,
    useFactory: (repo: IMenuItemsRepository) =>
      new FindAllMenuItemsUseCase(repo),
    inject: [I_MENU_ITEMS_REPOSITORY],
  },
  {
    provide: FindMenuItemUseCase,
    useFactory: (repo: IMenuItemsRepository) => new FindMenuItemUseCase(repo),
    inject: [I_MENU_ITEMS_REPOSITORY],
  },
  {
    provide: UpdateMenuItemUseCase,
    useFactory: (
      repo: IMenuItemsRepository,
      findMealUseCase: FindMealUseCase,
    ) => new UpdateMenuItemUseCase(repo, findMealUseCase),
    inject: [I_MENU_ITEMS_REPOSITORY, FindMealUseCase],
  },
  {
    provide: DeleteMenuItemUseCase,
    useFactory: (repo: IMenuItemsRepository) => new DeleteMenuItemUseCase(repo),
    inject: [I_MENU_ITEMS_REPOSITORY],
  },
];
