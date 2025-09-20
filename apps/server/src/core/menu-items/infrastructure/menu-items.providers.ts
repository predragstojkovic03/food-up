import { Provider } from '@nestjs/common';

import { I_MENU_ITEMS_REPOSITORY } from '../domain/menu-items.repository.interface';
import { MenuItemsTypeOrmRepository } from './persistence/menu-items-typeorm.repository';

export const MenuItemsRepositoryProvide: Provider = {
  provide: I_MENU_ITEMS_REPOSITORY,
  useClass: MenuItemsTypeOrmRepository,
};
