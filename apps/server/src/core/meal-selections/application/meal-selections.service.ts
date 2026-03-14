import { Inject, Injectable } from '@nestjs/common';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import { MenuItemsService } from 'src/core/menu-items/application/menu-items.service';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
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
    private readonly _menuItemsService: MenuItemsService,
  ) {}

  async create(
    identityId: string,
    dto: CreateMealSelectionDto,
  ): Promise<MealSelection> {
    const employee = await this._employeesService.findByIdentity(identityId);

    const mealSelectionWindow = await this._mealSelectionWindowsService.findOne(
      dto.mealSelectionWindowId,
    );

    if (!mealSelectionWindow.isActive) {
      throw new InvalidInputDataException(
        'Meal selection window is not active',
      );
    }

    const menuItem = await this._menuItemsService.findOne(dto.menuItemId);

    if (!mealSelectionWindow.menuPeriodIds.includes(menuItem.menuPeriodId)) {
      throw new InvalidInputDataException(
        `Menu item with ID ${dto.menuItemId} does not belong to any of the menu periods associated with meal selection window ${dto.mealSelectionWindowId}`,
      );
    }

    const mealSelection = MealSelection.create(
      employee.id,
      dto.menuItemId,
      mealSelectionWindow.id,
      menuItem.day,
      dto.quantity,
    );

    await this._repository.insert(mealSelection);

    return mealSelection;
  }

  async findAll(): Promise<MealSelection[]> {
    return this._repository.findAll();
  }

  findOne(id: string): Promise<MealSelection> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  findByEmployeeAndWindow(
    employeeId: string,
    mealSelectionWindowId: string,
  ): Promise<MealSelection | null> {
    return this._repository.findOneByCriteria({
      employeeId,
      mealSelectionWindowId,
    });
  }

  async update(
    id: string,
    identityId: string,
    dto: UpdateMealSelectionDto,
  ): Promise<MealSelection> {
    const employee = await this._employeesService.findByIdentity(identityId);

    const mealSelection = await this._repository.findOneByCriteriaOrThrow({
      id,
      employeeId: employee.id,
    });

    const mealSelectionWindow = await this._mealSelectionWindowsService.findOne(
      mealSelection.mealSelectionWindowId,
    );

    if (!mealSelectionWindow.isActive) {
      throw new InvalidInputDataException(
        'Meal selection window is not active',
      );
    }

    if (dto.menuItemId) {
      const menuItem = await this._menuItemsService.findOne(dto.menuItemId);

      if (!mealSelectionWindow.menuPeriodIds.includes(menuItem.menuPeriodId)) {
        throw new InvalidInputDataException(
          `Menu item with ID ${dto.menuItemId} does not belong to any of the menu periods associated with meal selection window ${mealSelection.mealSelectionWindowId}`,
        );
      }
    }

    mealSelection.update(dto.menuItemId, dto.quantity);

    await this._repository.update(id, mealSelection);

    return mealSelection;
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
