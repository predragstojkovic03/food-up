import { Inject, Injectable } from '@nestjs/common';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
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
    private readonly mealSelectionWindowsService: MealSelectionWindowsService,
  ) {}

  async create(dto: CreateMealSelectionDto): Promise<MealSelection> {
    const mealSelectionWindow = await this.mealSelectionWindowsService.findOne(
      dto.mealSelectionWindowId,
    );

    const mealSelection = MealSelection.create(
      ulid(),
      dto.employeeId,
      dto.menuItemId,
      mealSelectionWindow,
      dto.date,
      dto.quantity,
    );

    return this._repository.insert(mealSelection);
  }

  async findAll(): Promise<MealSelection[]> {
    return this._repository.findAll();
  }

  findOne(id: string): Promise<MealSelection> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  async update(
    id: string,
    dto: UpdateMealSelectionDto,
  ): Promise<MealSelection> {
    const existing = await this._repository.findOneByCriteriaOrThrow({ id });

    const mealSelectionWindow = await this.mealSelectionWindowsService.findOne(
      dto.mealSelectionWindowId ?? existing.mealSelectionWindowId,
    );

    const mealSelection = MealSelection.create(
      existing.id,
      existing.employeeId,
      dto.menuItemId ?? existing.menuItemId,
      mealSelectionWindow,
      dto.date ?? existing.date,
      dto.quantity ?? existing.quantity,
    );

    return this._repository.update(id, mealSelection);
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
