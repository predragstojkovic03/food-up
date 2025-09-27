import { Inject, Injectable } from '@nestjs/common';
import { MealsService } from 'src/core/meals/application/meals.service';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { ulid } from 'ulid';
import { MenuItem } from '../domain/menu-item.entity';
import {
  I_MENU_ITEMS_REPOSITORY,
  IMenuItemsRepository,
} from '../domain/menu-items.repository.interface';
import { MenuItemsQueryService } from './queries/menu-items-query.service';

@Injectable()
export class MenuItemsService {
  constructor(
    @Inject(I_MENU_ITEMS_REPOSITORY)
    private readonly _repository: IMenuItemsRepository,
    private readonly _menuItemsQueryService: MenuItemsQueryService,
    private readonly _mealsService: MealsService,
  ) {}

  async create(dto: {
    price?: number | null;
    menuPeriodId: string;
    day: string;
    mealId: string;
  }): Promise<MenuItem> {
    const meal = await this._mealsService.findOne(dto.mealId);

    const existingMealOnSameDay = await this._repository.findOneByCriteria({
      menuPeriodId: dto.menuPeriodId,
      day: dto.day,
      mealId: meal.id,
    });

    if (existingMealOnSameDay) {
      throw new InvalidInputDataException(
        `Meal with ID ${meal.id} is already assigned to menu period ${dto.menuPeriodId} on day ${dto.day}`,
      );
    }

    const menuItem = new MenuItem(
      ulid(),
      dto.price,
      dto.menuPeriodId,
      dto.day,
      meal.id,
    );

    await this._repository.insert(menuItem);

    return menuItem;
  }

  async findAll(): Promise<MenuItem[]> {
    return this._repository.findAll();
  }

  async findOne(id: string): Promise<MenuItem> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  async update(
    id: string,
    dto: { price?: number | null; day?: string },
  ): Promise<MenuItem> {
    const menuItem = await this.findOne(id);

    if (dto.price !== undefined) {
      menuItem.price = dto.price;
    }

    if (dto.day !== undefined) {
      menuItem.day = dto.day;
    }

    await this._repository.update(id, menuItem);

    return menuItem;
  }

  findWithMealsByMenuPeriods(
    menuPeriodIds: string[],
  ): Promise<MenuItemWithMealDto[]> {
    return this._menuItemsQueryService.findWithMealsByMenuPeriodIds(
      menuPeriodIds,
    );
  }

  findBulkByMenuPeriodIds(menuPeriodIds: string[]): Promise<MenuItem[]> {
    return this._repository.findBulkByMenuPeriodIdsWithMeal(menuPeriodIds);
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
