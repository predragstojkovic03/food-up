import { Inject, Injectable } from '@nestjs/common';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { MenuItemsService } from 'src/core/menu-items/application/menu-items.service';
import { MenuItemsQueryService } from 'src/core/menu-items/application/queries/menu-items-query.service';
import { MenuPeriodsService } from 'src/core/menu-periods/application/menu-periods.service';
import { ulid } from 'ulid';
import { MealSelectionWindow } from '../domain/meal-selection-window.entity';
import {
  I_MEAL_SELECTION_WINDOWS_REPOSITORY,
  IMealSelectionWindowsRepository,
} from '../domain/meal-selection-windows.repository.interface';
import { GetCurrentMealSelectionWindowResponseDto } from '../presentation/rest/dto/get-current-meal-selection-window-response.dto';

export interface CreateMealSelectionWindowDto {
  startTime: Date;
  endTime: Date;
  menuPeriodIds: string[];
  targetDates: Set<string>;
}

export interface UpdateMealSelectionWindowDto {
  startTime?: Date;
  endTime?: Date;
  businessId?: string;
  menuPeriodIds?: string[];
  targetDates?: Set<string>;
}

@Injectable()
export class MealSelectionWindowsService {
  constructor(
    @Inject(I_MEAL_SELECTION_WINDOWS_REPOSITORY)
    private readonly _repository: IMealSelectionWindowsRepository,
    private readonly _menuPeriodsService: MenuPeriodsService,
    private readonly _employeesService: EmployeesService,
    private readonly _menuItemsService: MenuItemsService,
    private readonly _menuItemsQueryService: MenuItemsQueryService,
  ) {}

  async create(
    identityId: string,
    dto: CreateMealSelectionWindowDto,
  ): Promise<MealSelectionWindow> {
    const employee = await this._employeesService.findByIdentity(identityId);

    if (dto.menuPeriodIds) {
      const menuPeriods = await Promise.all(
        dto.menuPeriodIds.map((id) => this._menuPeriodsService.findOne(id)),
      );
    }
    const window = new MealSelectionWindow(
      ulid(),
      dto.startTime,
      dto.endTime,
      dto.targetDates,
      employee.businessId,
      dto.menuPeriodIds,
    );
    return this._repository.insert(window);
  }

  async findAll(): Promise<MealSelectionWindow[]> {
    return this._repository.findAll();
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
      const menuPeriods = await Promise.all(
        dto.menuPeriodIds.map((id) => this._menuPeriodsService.findOne(id)),
      );
    }

    const updated = existing.update(
      dto.startTime,
      dto.endTime,
      dto.businessId,
      dto.menuPeriodIds,
      dto.targetDates,
    );

    await this._repository.update(id, updated);
    return updated;
  }

  async findCurrent(
    sub: string,
  ): Promise<GetCurrentMealSelectionWindowResponseDto> {
    const employee = await this._employeesService.findByIdentity(sub);

    const mealSelectionWindow =
      await this._repository.findLatestActiveByBusiness(employee.businessId);

    const menuItems =
      await this._menuItemsQueryService.findMenuItemsWithMealsByMenuPeriodIds(
        mealSelectionWindow.menuPeriodIds,
      );

    return {
      id: mealSelectionWindow.id,
      startTime: mealSelectionWindow.startTime,
      endTime: mealSelectionWindow.endTime,
      menuItems,
    };
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
