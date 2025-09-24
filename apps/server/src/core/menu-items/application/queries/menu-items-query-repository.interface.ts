export const I_MENU_ITEMS_QUERY_REPOSITORY = Symbol(
  'I_MENU_ITEMS_QUERY_REPOSITORY',
);

export interface IMenuItemsQueryRepository {
  findMenuItemsWithMealsByMenuPeriodIds(
    menuPeriodIds: string[],
  ): Promise<MenuItemWithMealDto[]>;
}
