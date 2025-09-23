import { Inject, Injectable } from '@nestjs/common';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import { MenuPeriodsService } from 'src/core/menu-periods/application/menu-periods.service';
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
    private readonly _mealSelectionWindowsService: MealSelectionWindowsService,
    private readonly _employeesService: EmployeesService,
    private readonly _menuPeriodsService: MenuPeriodsService,
  ) {}

  async create(
    identityId: string,
    dto: CreateMealSelectionDto,
  ): Promise<MealSelection> {
    const employee = await this._employeesService.findByIdentity(identityId);

    const mealSelectionWindow = await this._mealSelectionWindowsService.findOne(
      dto.mealSelectionWindowId,
    );

    const menuPeriods = await this._menuPeriodsService.findBulkByIds(
      mealSelectionWindow.menuPeriodIds,
    );

    const mealSelection = MealSelection.create(
      ulid(),
      employee.id,
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

    const mealSelectionWindow = await this._mealSelectionWindowsService.findOne(
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
