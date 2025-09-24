import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { BusinessesService } from 'src/core/businesses/application/businesses.service';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { SuppliersService } from 'src/core/suppliers/application/suppliers.service';
import { AuthenticationException } from 'src/shared/domain/exceptions/authentication.exception';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { EmployeeRole } from 'src/shared/domain/role.enum';
import { ulid } from 'ulid';
import { Meal } from '../domain/meal.entity';
import {
  I_MEALS_REPOSITORY,
  IMealsRepository,
} from '../domain/meals.repository.interface';
import { CreateMealDto } from '../presentation/rest/dto/create-meal.dto';
import { UpdateMealDto } from '../presentation/rest/dto/update-meal.dto';

@Injectable()
export class MealsService {
  constructor(
    @Inject(I_MEALS_REPOSITORY)
    private readonly _repository: IMealsRepository,
    private readonly _identityService: IdentityService,
    private readonly _suppliersService: SuppliersService,
    private readonly _employeesService: EmployeesService,
    private readonly _businessesService: BusinessesService,
  ) {}

  async create(identityId: string, dto: CreateMealDto): Promise<Meal> {
    const identity = await this._identityService.findById(identityId);
    let supplierId = dto.supplierId;

    if (!identity) {
      throw new AuthenticationException('Identity not found');
    }

    if (identity.type === IdentityType.Supplier) {
      const supplier = await this._suppliersService.findByIdentityId(
        identity.id,
      );

      supplierId = supplier.id;
    } else if (identity.type === IdentityType.Employee) {
      if (!dto.supplierId) {
        throw new InvalidInputDataException(
          'Supplier ID must be provided when creating a meal as an employee.',
        );
      }

      const employee = await this._employeesService.findByIdentity(identity.id);

      if (employee.role !== EmployeeRole.Manager) {
        throw new UnauthorizedException('Only managers can create meals.');
      }

      const business = await this._businessesService.findOne(
        employee.businessId,
      );

      if (!business.managedSupplierIds.includes(dto.supplierId)) {
        throw new UnauthorizedException(
          'You can only create meals for suppliers managed by your business.',
        );
      }
    }

    if (!supplierId) {
      throw new InvalidInputDataException('Supplier ID is required.');
    }

    const meal = new Meal(
      ulid(),
      dto.name,
      dto.description,
      dto.type,
      supplierId,
    );

    return this._repository.insert(meal);
  }

  async findAll(): Promise<Meal[]> {
    return this._repository.findAll();
  }

  async findOne(id: string): Promise<Meal> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  async update(id: string, dto: UpdateMealDto): Promise<Meal> {
    const existing = await this._repository.findOneByCriteria({ id });
    if (!existing) throw new EntityInstanceNotFoundException('Meal not found');
    return this._repository.update(id, { ...existing, ...dto } as any);
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
