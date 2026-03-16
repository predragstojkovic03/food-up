import { Inject, Injectable } from '@nestjs/common';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import { MealSelectionsService } from 'src/core/meal-selections/application/meal-selections.service';
import { MenuItemsService } from 'src/core/menu-items/application/menu-items.service';
import { DomainEvents } from 'src/shared/application/domain-events/domain-events.decorator';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { UnauthorizedException } from 'src/shared/domain/exceptions/unauthorized.exception';
import { ChangeRequestStatus, EmployeeRole } from '@food-up/shared';
import { ChangeRequest } from '../domain/change-request.entity';
import {
  I_CHANGE_REQUESTS_REPOSITORY,
  IChangeRequestsRepository,
} from '../domain/change-requests.repository.interface';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { UpdateChangeRequestDto } from './dto/update-change-request.dto';
@Injectable()
export class ChangeRequestsService {
  constructor(
    @Inject(I_CHANGE_REQUESTS_REPOSITORY)
    private readonly _repository: IChangeRequestsRepository,
    private readonly _mealSelectionsService: MealSelectionsService,
    private readonly _menuItemsService: MenuItemsService,
    private readonly _employeesService: EmployeesService,
    private readonly _mealSelectionWindowsService: MealSelectionWindowsService,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {}

  @DomainEvents
  async create(
    identityId: string,
    dto: CreateChangeRequestDto,
  ): Promise<ChangeRequest> {
    const employee = await this._employeesService.findByIdentity(identityId);

    const mealSelectionWindow = await this._mealSelectionWindowsService.findOne(
      dto.mealSelectionWindowId,
    );

    if (!mealSelectionWindow.isPastDeadline) {
      throw new InvalidInputDataException(
        'Cannot create a change request for a meal selection window that has not passed its deadline.',
      );
    }

    if (dto.mealSelectionId) {
      const mealSelection = await this._mealSelectionsService.findOne(
        dto.mealSelectionId,
      );

      if (mealSelection.employeeId !== employee.id) {
        throw new UnauthorizedException(
          'Employee can only create change requests for their own meal selections.',
        );
      }

      if (mealSelection.mealSelectionWindowId !== mealSelectionWindow.id) {
        throw new InvalidInputDataException(
          'Meal selection does not belong to the specified meal selection window.',
        );
      }
    } else {
      const existingSelection =
        await this._mealSelectionsService.findByEmployeeAndWindow(
          employee.id,
          mealSelectionWindow.id,
        );

      if (existingSelection) {
        throw new InvalidInputDataException(
          'Employee already has a meal selection for this window. Reference it via mealSelectionId instead.',
        );
      }
    }

    if (dto.newMenuItemId) {
      const newMenuItem = await this._menuItemsService.findOne(dto.newMenuItemId);

      if (!mealSelectionWindow.menuPeriodIds.includes(newMenuItem.menuPeriodId)) {
        throw new InvalidInputDataException(
          `New menu item with ID ${dto.newMenuItemId} does not belong to any of the menu periods associated with meal selection window ${mealSelectionWindow.id}`,
        );
      }
    }

    const changeRequest = ChangeRequest.create(
      employee.id,
      mealSelectionWindow.id,
      dto.newMenuItemId ?? null,
      dto.newQuantity ?? null,
      dto.mealSelectionId,
      dto.clearSelection,
    );

    await this._repository.insert(changeRequest);

    return changeRequest;
  }

  async findAll(): Promise<ChangeRequest[]> {
    return this._repository.findAll();
  }

  async findOne(id: string): Promise<ChangeRequest | null> {
    return this._repository.findOneByCriteria({ id });
  }

  @DomainEvents
  async update(
    id: string,
    identityId: string,
    dto: UpdateChangeRequestDto,
  ): Promise<ChangeRequest> {
    const employee = await this._employeesService.findByIdentity(identityId);

    const changeRequest = await this._repository.findOneByCriteriaOrThrow({
      id,
      employeeId: employee.id,
    });

    if (dto.newMenuItemId) {
      const mealSelectionWindow = await this._mealSelectionWindowsService.findOne(
        changeRequest.mealSelectionWindowId,
      );
      const newMenuItem = await this._menuItemsService.findOne(dto.newMenuItemId);

      if (!mealSelectionWindow.menuPeriodIds.includes(newMenuItem.menuPeriodId)) {
        throw new InvalidInputDataException(
          `New menu item with ID ${dto.newMenuItemId} does not belong to any of the menu periods associated with meal selection window ${changeRequest.mealSelectionWindowId}`,
        );
      }
    }

    changeRequest.updateSelection(
      dto.newMenuItemId,
      dto.newQuantity,
      dto.clearSelection,
    );

    await this._repository.update(id, changeRequest);

    return changeRequest;
  }

  @DomainEvents
  async updateStatus(
    id: string,
    performedByIdentityId: string,
    status: ChangeRequestStatus,
  ): Promise<ChangeRequest> {
    const changeRequest = await this._repository.findOneByCriteriaOrThrow({
      id,
    });
    const performer = await this._employeesService.findByIdentity(
      performedByIdentityId,
    );

    if (performer.role !== EmployeeRole.Manager) {
      throw new UnauthorizedException(
        'Only managers can change the status of a change request',
      );
    }

    changeRequest.changeStatus(status, performer.id, new Date());
    await this._repository.update(id, changeRequest);

    return changeRequest;
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
