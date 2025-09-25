export const I_MENU_ITEMS_QUERY_REPOSITORY = Symbol(
  'I_MENU_ITEMS_QUERY_REPOSITORY',
);

export interface IMenuItemsQueryRepository {
  findWithMealsByMenuPeriodIds(
    menuPeriodIds: string[],
  ): Promise<MenuItemWithMealDto[]>;
}
