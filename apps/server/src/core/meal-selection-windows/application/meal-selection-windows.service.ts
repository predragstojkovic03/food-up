import { Inject, Injectable } from '@nestjs/common';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { MenuItemsService } from 'src/core/menu-items/application/menu-items.service';
import { MenuItemWithMealDto } from 'src/core/menu-items/application/queries/dto/find-menu-items-with-meals.dto';
import { MenuPeriodsService } from 'src/core/menu-periods/application/menu-periods.service';
import { DomainEvents } from 'src/shared/application/domain-events/domain-events.decorator';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
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
  notifyOnDeadline?: boolean;
}

export interface UpdateMealSelectionWindowDto {
  startTime?: Date;
  endTime?: Date;
  businessId?: string;
  menuPeriodIds?: string[];
  targetDates?: string[];
  isLocked?: boolean;
  notifyOnDeadline?: boolean;
  notifyEmployees?: boolean;
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

    await this._validateMenuPeriodsForTargetDates(dto.menuPeriodIds, dto.targetDates);

    const window = MealSelectionWindow.create(
      dto.startTime,
      dto.endTime,
      new Set(dto.targetDates),
      employee.businessId,
      dto.menuPeriodIds,
      dto.notifyOnDeadline ?? false,
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

  @DomainEvents
  async update(
    id: string,
    dto: UpdateMealSelectionWindowDto,
  ): Promise<MealSelectionWindow> {
    const existing = await this._repository.findOneByCriteriaOrThrow({ id });

    if (dto.menuPeriodIds || dto.targetDates) {
      const effectiveMenuPeriodIds = dto.menuPeriodIds ?? existing.menuPeriodIds;
      const effectiveTargetDates = dto.targetDates ?? Array.from(existing.targetDates);
      await this._validateMenuPeriodsForTargetDates(effectiveMenuPeriodIds, effectiveTargetDates);
    }

    const updated = existing.update(
      dto.startTime,
      dto.endTime,
      dto.businessId,
      dto.menuPeriodIds,
      dto.targetDates ? new Set(dto.targetDates) : undefined,
      dto.isLocked,
      dto.notifyOnDeadline,
      dto.notifyEmployees,
    );

    await this._repository.save(updated);
    this._logger.log(
      `Meal selection window updated: id=${id}`,
      MealSelectionWindowsService.name,
    );
    return updated;
  }

  async findMenuItemsForWindow(
    windowId: string,
  ): Promise<MenuItemWithMealDto[]> {
    const window = await this._repository.findOneByCriteriaOrThrow({
      id: windowId,
    });
    return this._menuItemsService.findWithMealsByMenuPeriods(
      window.menuPeriodIds,
    );
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

  private async _validateMenuPeriodsForTargetDates(
    menuPeriodIds: string[],
    targetDates: string[],
  ): Promise<void> {
    const menuPeriods = await this._menuPeriodsService.findBulkByIds(menuPeriodIds);

    for (const date of targetDates) {
      const covered = menuPeriods.some(
        (mp) => mp.startDate <= date && mp.endDate >= date,
      );
      if (!covered) {
        throw new InvalidInputDataException(
          `Target date ${date} is not covered by any selected menu period's date range`,
        );
      }
    }

    const menuItems = await this._menuItemsService.findWithMealsByMenuPeriods(menuPeriodIds);
    const daysWithItems = new Set(menuItems.map((item) => item.day));

    for (const date of targetDates) {
      if (!daysWithItems.has(date)) {
        throw new InvalidInputDataException(
          `No menu items are scheduled for target date ${date}`,
        );
      }
    }
  }
}
