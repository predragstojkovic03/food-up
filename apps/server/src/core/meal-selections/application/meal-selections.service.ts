import { Inject, Injectable } from '@nestjs/common';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import { MenuItemsService } from 'src/core/menu-items/application/menu-items.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { MealSelection } from '../domain/meal-selection.entity';
import {
  I_MEAL_SELECTIONS_REPOSITORY,
  IMealSelectionsRepository,
  RichMealSelection,
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
    @Inject(I_LOGGER) private readonly _logger: ILogger,
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

    if (!mealSelectionWindow.targetDates.has(dto.date)) {
      throw new InvalidInputDataException(
        `Date ${dto.date} is not a valid target date for this meal selection window`,
      );
    }

    if (dto.menuItemId) {
      const menuItem = await this._menuItemsService.findOne(dto.menuItemId);

      if (!mealSelectionWindow.menuPeriodIds.includes(menuItem.menuPeriodId)) {
        throw new InvalidInputDataException(
          `Menu item ${dto.menuItemId} does not belong to any menu period of window ${dto.mealSelectionWindowId}`,
        );
      }
    }

    const mealSelection = MealSelection.create(
      employee.id,
      mealSelectionWindow.id,
      dto.date,
      dto.menuItemId,
      dto.quantity,
    );

    await this._repository.insert(mealSelection);
    this._logger.log(
      `Meal selection created: id=${mealSelection.id} employeeId=${employee.id} windowId=${dto.mealSelectionWindowId} date=${dto.date}`,
      MealSelectionsService.name,
    );

    return mealSelection;
  }

  async findAll(): Promise<MealSelection[]> {
    return this._repository.findAll();
  }

  findOne(id: string): Promise<MealSelection> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  findByWindow(windowId: string): Promise<MealSelection[]> {
    return this._repository.findByWindow(windowId);
  }

  async findByEmployeeAndWindow(
    employeeId: string,
    windowId: string,
  ): Promise<MealSelection | null> {
    const results = await this._repository.findAllByEmployeeAndWindow(
      employeeId,
      windowId,
    );
    return results[0] ?? null;
  }

  async findMySelectionsForWindow(
    identityId: string,
    windowId: string,
  ): Promise<RichMealSelection[]> {
    const employee = await this._employeesService.findByIdentity(identityId);
    return this._repository.findRichByEmployeeAndWindow(employee.id, windowId);
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
          `Menu item ${dto.menuItemId} does not belong to any menu period of window ${mealSelection.mealSelectionWindowId}`,
        );
      }
    }

    mealSelection.update(dto.menuItemId, dto.quantity);

    await this._repository.update(id, mealSelection);
    this._logger.log(`Meal selection updated: id=${id}`, MealSelectionsService.name);

    return mealSelection;
  }

  async delete(id: string): Promise<void> {
    await this._repository.delete(id);
    this._logger.log(`Meal selection deleted: id=${id}`, MealSelectionsService.name);
  }
}
