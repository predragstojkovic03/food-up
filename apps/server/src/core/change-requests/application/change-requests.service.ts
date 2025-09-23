import { Inject, Injectable } from '@nestjs/common';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { MealSelectionsService } from 'src/core/meal-selections/application/meal-selections.service';
import { MenuItemsService } from 'src/core/menu-items/application/menu-items.service';
import { DomainEvents } from 'src/shared/application/domain-events/domain-events.decorator';
import { UnauthorizedException } from 'src/shared/domain/exceptions/unauthorized.exception';
import { EmployeeRole } from 'src/shared/domain/role.enum';
import { ulid } from 'ulid';
import { ChangeRequestStatus } from '../domain/change-request-status.enum';
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
    private readonly repo: IChangeRequestsRepository,
    private readonly mealSelectionsService: MealSelectionsService,
    private readonly menuItemsService: MenuItemsService,
    private readonly employeesService: EmployeesService,
  ) {}

  @DomainEvents
  async create(
    identityId: string,
    dto: CreateChangeRequestDto,
  ): Promise<ChangeRequest> {
    const employee = await this.employeesService.findByIdentity(identityId);

    const mealSelection = await this.mealSelectionsService.findOne(
      dto.mealSelectionId,
    );

    if (mealSelection.employeeId !== employee.id) {
      throw new UnauthorizedException(
        'Employee can only create change requests for his own meal selections.',
      );
    }

    if (dto.newMenuItemId) {
      await this.menuItemsService.findOne(dto.newMenuItemId);
    }

    const changeRequest = new ChangeRequest(
      ulid(),
      employee.id,
      dto.mealSelectionId,
      dto.newMenuItemId ?? null,
      dto.newQuantity ?? null,
      ChangeRequestStatus.Pending,
      dto.clearSelection,
      null,
      null,
    );

    await this.repo.insert(changeRequest);

    return changeRequest;
  }

  async findAll(): Promise<ChangeRequest[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<ChangeRequest | null> {
    return this.repo.findOneByCriteria({ id });
  }

  @DomainEvents
  async update(
    id: string,
    employeeId: string,
    dto: UpdateChangeRequestDto,
  ): Promise<ChangeRequest> {
    const changeRequest = await this.repo.findOneByCriteriaOrThrow({ id });

    const menuItemId =
      (await (async () => {
        if (dto.mealSelectionId) {
          return this.menuItemsService
            .findOne(dto.mealSelectionId)
            .then((ms) => ms.id);
        }

        return changeRequest.newMenuItemId;
      })()) ?? undefined;

    changeRequest.updateSelection(
      menuItemId,
      dto.newQuantity,
      dto.clearSelection,
    );

    await this.repo.update(id, changeRequest);

    return changeRequest;
  }

  @DomainEvents
  async updateStatus(
    id: string,
    performedByIdentityId: string,
    status: ChangeRequestStatus,
  ): Promise<ChangeRequest> {
    const changeRequest = await this.repo.findOneByCriteriaOrThrow({ id });
    const performer = await this.employeesService.findByIdentity(
      performedByIdentityId,
    );

    if (performer.role !== EmployeeRole.Manager) {
      throw new UnauthorizedException(
        'Only managers can change the status of a change request',
      );
    }

    changeRequest.changeStatus(status, performer.id, new Date());
    await this.repo.update(id, changeRequest);

    return changeRequest;
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
