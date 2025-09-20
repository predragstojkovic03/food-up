import { Inject, Injectable } from '@nestjs/common';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { ulid } from 'ulid';
import { MealSelection } from '../domain/meal-selection.entity';
import {
  I_MEAL_SELECTIONS_REPOSITORY,
  IMealSelectionsRepository,
} from '../domain/meal-selections.repository.interface';
import { CreateMealSelectionDto } from '../presentation/rest/dto/create-meal-selection.dto';
import { UpdateMealSelectionDto } from '../presentation/rest/dto/update-meal-selection.dto';

@Injectable()
export class MealSelectionsService {
  constructor(
    @Inject(I_MEAL_SELECTIONS_REPOSITORY)
    private readonly _repository: IMealSelectionsRepository,
  ) {}

  async create(dto: CreateMealSelectionDto): Promise<MealSelection> {
    // Add any business logic/validation here
    const mealSelection = new MealSelection(
      ulid(),
      dto.employeeId,
      dto.menuItemId,
      dto.mealSelectionWindowId,
      dto.date,
      dto.quantity,
    );

    return this._repository.insert(mealSelection);
  }

  async findAll(): Promise<MealSelection[]> {
    return this._repository.findAll();
  }

  async findOne(id: string): Promise<MealSelection> {
    const result = await this._repository.findOneByCriteria({ id });

    if (!result)
      throw new EntityInstanceNotFoundException('MealSelection not found');

    return result;
  }

  async update(
    id: string,
    dto: UpdateMealSelectionDto,
  ): Promise<MealSelection> {
    const existing = await this._repository.findOneByCriteria({ id });

    if (!existing)
      throw new EntityInstanceNotFoundException('MealSelection not found');

    return this._repository.update(id, { ...existing, ...dto } as any);
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
