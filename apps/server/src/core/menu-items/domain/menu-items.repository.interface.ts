import { IRepository } from 'src/shared/domain/repository.interface';
import { MenuItem } from './menu-item.entity';

export const I_MENU_ITEMS_REPOSITORY = Symbol('IMenuItemsRepository');

export interface IMenuItemsRepository extends IRepository<MenuItem> {}
