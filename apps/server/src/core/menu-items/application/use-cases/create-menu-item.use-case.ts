import { FindMealUseCase } from 'src/core/meals/application/find-meal.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { ulid } from 'ulid';
import { MenuItem } from '../../domain/menu-item.entity';
import { IMenuItemsRepository } from '../../domain/menu-items.repository.interface';

export interface CreateMenuItemDto {
  price?: number | null;
  menuPeriodId: string;
  day: Date;
  mealId: string;
}

export class CreateMenuItemUseCase {
  constructor(
    private readonly _repository: IMenuItemsRepository,
    private readonly _findMealUseCase: FindMealUseCase,
  ) {}

  async execute(dto: CreateMenuItemDto): Promise<MenuItem> {
    const meal = await this._findMealUseCase.execute(dto.mealId);
    if (!meal) {
      throw new EntityInstanceNotFoundException('Meal not found');
    }

    const entity = new MenuItem(
      ulid(),
      dto.price ?? meal.price ?? null,
      dto.menuPeriodId,
      dto.day,
      dto.mealId,
    );
    return this._repository.insert(entity);
  }
}
