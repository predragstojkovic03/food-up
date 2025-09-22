import { Inject, Injectable } from '@nestjs/common';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { MealSelectionsService } from 'src/core/meal-selections/application/meal-selections.service';
import { MenuItemsService } from 'src/core/menu-items/application/menu-items.service';
import { UnauthorizedException } from 'src/shared/domain/exceptions/unauthorized.exception';
import { EmployeeRole } from 'src/shared/domain/role.enum';
import { ulid } from 'ulid';
import { ChangeRequestStatus } from '../domain/change-request-status.enum';
import { ChangeRequest } from '../domain/change-request.entity';
import {
  I_CHANGE_REQUESTS_REPOSITORY,
  IChangeRequestsRepository,
} from '../domain/change-requests.repository.interface';
import { CreateChangeRequestDto } from '../presentation/rest/dto/create-change-request.dto';
import { UpdateChangeRequestDto } from '../presentation/rest/dto/update-change-request.dto';

@Injectable()
export class ChangeRequestsService {
  constructor(
    @Inject(I_CHANGE_REQUESTS_REPOSITORY)
    private readonly repo: IChangeRequestsRepository,
    private readonly mealSelectionsService: MealSelectionsService,
    private readonly menuItemsService: MenuItemsService,
    private readonly employeesService: EmployeesService,
  ) {}

  async create(
    employeeId: string,
    dto: CreateChangeRequestDto,
  ): Promise<ChangeRequest> {
    const mealSelection = await this.mealSelectionsService.findOne(
      dto.mealSelectionId,
    );

    const entity = new ChangeRequest(
      ulid(),
      employeeId,
      dto.mealSelectionId,
      dto.newMenuItemId ?? null,
      dto.newQuantity ?? null,
      ChangeRequestStatus.Pending,
      dto.clearSelection,
      null,
      null,
    );
    return this.repo.insert(entity);
  }

  async findAll(): Promise<ChangeRequest[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<ChangeRequest | null> {
    return this.repo.findOneByCriteria({ id });
  }

  async update(
    id: string,
    employeeId: string,
    dto: UpdateChangeRequestDto,
  ): Promise<ChangeRequest> {
    const existing = await this.repo.findOneByCriteriaOrThrow({ id });

    const menuItemId =
      (await (async () => {
        if (dto.mealSelectionId) {
          return this.menuItemsService
            .findOne(dto.mealSelectionId)
            .then((ms) => ms.id);
        }

        return existing.newMenuItemId;
      })()) ?? undefined;

    existing.updateSelection(menuItemId, dto.newQuantity, dto.clearSelection);

    return this.repo.update(id, existing);
  }

  async changeStatus(
    id: string,
    status: ChangeRequestStatus,
    employeeId: string,
  ): Promise<ChangeRequest> {
    const existing = await this.repo.findOneByCriteriaOrThrow({ id });
    const employee = await this.employeesService.findOne(employeeId);

    if (employee.role !== EmployeeRole.Manager) {
      throw new UnauthorizedException(
        'Only managers can change the status of a change request',
      );
    }

    existing.changeStatus(status, employee.id, new Date());
    return this.repo.update(id, existing);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
