import { Inject } from '@nestjs/common';
import {
  I_MENU_ITEMS_QUERY_REPOSITORY,
  IMenuItemsQueryRepository,
} from './menu-items-query-repository.interface';

export class MenuItemsQueryService {
  constructor(
    @Inject(I_MENU_ITEMS_QUERY_REPOSITORY)
    private readonly _repository: IMenuItemsQueryRepository,
  ) {}

  findMenuItemsWithMealsByMenuPeriodIds(
    menuPeriodIds: string[],
  ): Promise<MenuItemWithMealDto[]> {
    return this._repository.findMenuItemsWithMealsByMenuPeriodIds(
      menuPeriodIds,
    );
  }
}
