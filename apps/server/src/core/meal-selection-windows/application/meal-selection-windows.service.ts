import { Inject, Injectable } from '@nestjs/common';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { MenuPeriodsService } from 'src/core/menu-periods/application/menu-periods.service';
import { DispatchDomainEvents } from 'src/shared/application/domain-events/dispatch-events.decorator';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { ulid } from 'ulid';
import { MealSelectionWindow } from '../domain/meal-selection-window.entity';
import {
  I_MEAL_SELECTION_WINDOWS_REPOSITORY,
  IMealSelectionWindowsRepository,
} from '../domain/meal-selection-windows.repository.interface';

export interface CreateMealSelectionWindowDto {
  startTime: Date;
  endTime: Date;
  menuPeriodIds: string[];
}

export interface UpdateMealSelectionWindowDto {
  startTime?: Date;
  endTime?: Date;
  businessId?: string;
  menuPeriodIds?: string[];
}

@Injectable()
export class MealSelectionWindowsService {
  constructor(
    @Inject(I_MEAL_SELECTION_WINDOWS_REPOSITORY)
    private readonly _repository: IMealSelectionWindowsRepository,
    private readonly _menuPeriodsService: MenuPeriodsService,
    private readonly _employeesService: EmployeesService,
  ) {}

  @DispatchDomainEvents()
  async create(
    identityId: string,
    dto: CreateMealSelectionWindowDto,
  ): Promise<MealSelectionWindow> {
    const employee = await this._employeesService.findByIdentity(identityId);

    if (dto.menuPeriodIds) {
      const menuPeriods = await Promise.all(
        dto.menuPeriodIds.map((id) => this._menuPeriodsService.findOne(id)),
      );
      if (menuPeriods.includes(null)) {
        throw new EntityInstanceNotFoundException('MenuPeriod not found');
      }
    }
    const window = new MealSelectionWindow(
      ulid(),
      dto.startTime,
      dto.endTime,
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
      if (menuPeriods.includes(null)) {
        throw new EntityInstanceNotFoundException('MenuPeriod not found');
      }
    }

    const updated = existing.update(
      dto.startTime,
      dto.endTime,
      dto.businessId,
      dto.menuPeriodIds,
    );

    await this._repository.update(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
