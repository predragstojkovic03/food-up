import { FindMealUseCase } from 'src/core/meals/application/find-meal.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { MenuItem } from '../../domain/menu-item.entity';
import { IMenuItemsRepository } from '../../domain/menu-items.repository.interface';

export interface UpdateMenuItemDto {
  price?: number | null;
  menuPeriodId?: string;
  day?: Date;
  mealId?: string;
}

export class UpdateMenuItemUseCase {
  constructor(
    private readonly _repository: IMenuItemsRepository,
    private readonly _findMealUseCase: FindMealUseCase,
  ) {}

  async execute(id: string, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const existing = await this._repository.findOneByCriteria({ id });
    if (!existing)
      throw new EntityInstanceNotFoundException('MenuItem not found');

    let mealIdToCheck = dto.mealId ?? existing.mealId;
    if (mealIdToCheck !== existing.mealId) {
      const meal = await this._findMealUseCase.execute(mealIdToCheck);
      if (!meal) {
        throw new EntityInstanceNotFoundException('Meal not found');
      }
    }

    const updated = new MenuItem(
      id,
      dto.price ?? existing.price,
      dto.menuPeriodId ?? existing.menuPeriodId,
      dto.day ?? existing.day,
      mealIdToCheck,
    );
    return this._repository.update(id, updated);
  }
}
