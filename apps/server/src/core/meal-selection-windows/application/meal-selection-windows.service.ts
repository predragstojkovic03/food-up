import { Inject, Injectable } from '@nestjs/common';
import { MenuItemWithMealDto } from 'src/core/menu-items/application/queries/dto/find-menu-items-with-meals.dto';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { MenuItemsService } from 'src/core/menu-items/application/menu-items.service';
import { MenuPeriodsService } from 'src/core/menu-periods/application/menu-periods.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { MealSelectionWindow } from '../domain/meal-selection-window.entity';
import {
  I_MEAL_SELECTION_WINDOWS_REPOSITORY,
  IMealSelectionWindowsRepository,
} from '../domain/meal-selection-windows.repository.interface';

export interface CreateMealSelectionWindowDto {
  startTime: Date;
  endTime: Date;
  menuPeriodIds: string[];
  targetDates: string[];
}

export interface UpdateMealSelectionWindowDto {
  startTime?: Date;
  endTime?: Date;
  businessId?: string;
  menuPeriodIds?: string[];
  targetDates?: string[];
  isLocked?: boolean;
}

export interface CurrentMealSelectionWindowResult {
  id: string;
  startTime: Date;
  endTime: Date;
  targetDates: string[];
  menuItems: MenuItemWithMealDto[];
}

export interface RelevantMealSelectionWindowResult {
  id: string;
  startTime: Date;
  endTime: Date;
  targetDates: string[];
  isActive: boolean;
}

@Injectable()
export class MealSelectionWindowsService {
  constructor(
    @Inject(I_MEAL_SELECTION_WINDOWS_REPOSITORY)
    private readonly _repository: IMealSelectionWindowsRepository,
    private readonly _menuPeriodsService: MenuPeriodsService,
    private readonly _employeesService: EmployeesService,
    private readonly _menuItemsService: MenuItemsService,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {}

  async create(
    identityId: string,
    dto: CreateMealSelectionWindowDto,
  ): Promise<MealSelectionWindow> {
    const employee = await this._employeesService.findByIdentity(identityId);

    if (dto.menuPeriodIds) {
      await Promise.all(
        dto.menuPeriodIds.map((id) => this._menuPeriodsService.findOne(id)),
      );
    }
    const window = MealSelectionWindow.create(
      dto.startTime,
      dto.endTime,
      new Set(dto.targetDates),
      employee.businessId,
      dto.menuPeriodIds,
    );
    const result = await this._repository.save(window);
    this._logger.log(
      `Meal selection window created: id=${result.id} businessId=${employee.businessId} startTime=${dto.startTime.toISOString()} endTime=${dto.endTime.toISOString()}`,
      MealSelectionWindowsService.name,
    );
    return result;
  }

  async findAll(): Promise<MealSelectionWindow[]> {
    return this._repository.findAll();
  }

  async findByMyBusiness(identityId: string): Promise<MealSelectionWindow[]> {
    const employee = await this._employeesService.findByIdentity(identityId);
    return this._repository.findAllByBusiness(employee.businessId);
  }

  async findOne(id: string): Promise<MealSelectionWindow> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  async update(
    id: string,
    dto: UpdateMealSelectionWindowDto,
  ): Promise<MealSelectionWindow> {
    const existing = await this._repository.findOneByCriteriaOrThrow({ id });

    if (dto.menuPeriodIds) {
      await Promise.all(
        dto.menuPeriodIds.map((id) => this._menuPeriodsService.findOne(id)),
      );
    }

    const updated = existing.update(
      dto.startTime,
      dto.endTime,
      dto.businessId,
      dto.menuPeriodIds,
      dto.targetDates ? new Set(dto.targetDates) : undefined,
      dto.isLocked,
    );

    await this._repository.save(updated);
    this._logger.log(
      `Meal selection window updated: id=${id}`,
      MealSelectionWindowsService.name,
    );
    return updated;
  }

  async findMenuItemsForWindow(windowId: string): Promise<MenuItemWithMealDto[]> {
    const window = await this._repository.findOneByCriteriaOrThrow({ id: windowId });
    return this._menuItemsService.findWithMealsByMenuPeriods(window.menuPeriodIds);
  }

  async findCurrent(sub: string): Promise<CurrentMealSelectionWindowResult> {
    const employee = await this._employeesService.findByIdentity(sub);

    const mealSelectionWindow =
      await this._repository.findLatestActiveByBusiness(employee.businessId);

    const menuItems = await this._menuItemsService.findWithMealsByMenuPeriods(
      mealSelectionWindow.menuPeriodIds,
    );

    return {
      id: mealSelectionWindow.id,
      startTime: mealSelectionWindow.startTime,
      endTime: mealSelectionWindow.endTime,
      targetDates: Array.from(mealSelectionWindow.targetDates),
      menuItems,
    };
  }

  async findRelevant(
    identityId: string,
  ): Promise<RelevantMealSelectionWindowResult | null> {
    const employee = await this._employeesService.findByIdentity(identityId);
    const window = await this._repository.findLatestPublishedByBusiness(
      employee.businessId,
    );
    if (!window) return null;
    return {
      id: window.id,
      startTime: window.startTime,
      endTime: window.endTime,
      targetDates: Array.from(window.targetDates),
      isActive: window.isActive,
    };
  }

  async delete(id: string): Promise<void> {
    await this._repository.delete(id);
    this._logger.log(
      `Meal selection window deleted: id=${id}`,
      MealSelectionWindowsService.name,
    );
  }
}
