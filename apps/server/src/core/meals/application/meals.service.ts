import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { BusinessesService } from 'src/core/businesses/application/businesses.service';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { EmployeeRole, IdentityType } from '@food-up/shared';
import { SuppliersService } from 'src/core/suppliers/application/suppliers.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { AuthenticationException } from 'src/shared/domain/exceptions/authentication.exception';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
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
    @Inject(I_LOGGER) private readonly _logger: ILogger,
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
        this._logger.warn(
          `Unauthorized meal creation: supplierId=${dto.supplierId} not managed by businessId=${business.id}`,
          MealsService.name,
        );
        throw new UnauthorizedException(
          'You can only create meals for suppliers managed by your business.',
        );
      }
    }

    if (!supplierId) {
      throw new InvalidInputDataException('Supplier ID is required.');
    }

    const meal = Meal.create(
      dto.name,
      dto.description,
      dto.type,
      supplierId,
      dto.price,
    );

    const result = await this._repository.insert(meal);
    this._logger.log(
      `Meal created: id=${result.id} name=${dto.name} supplierId=${supplierId}`,
      MealsService.name,
    );
    return result;
  }

  async findAll(): Promise<Meal[]> {
    return this._repository.findAll();
  }

  async findBySupplier(supplierId: string): Promise<Meal[]> {
    return this._repository.findByCriteria({ supplierId } as any);
  }

  async findOne(id: string): Promise<Meal> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  async update(id: string, dto: UpdateMealDto): Promise<Meal> {
    const existing = await this._repository.findOneByCriteria({ id });
    if (!existing) throw new EntityInstanceNotFoundException('Meal not found');
    const result = await this._repository.update(id, { ...existing, ...dto } as any);
    this._logger.log(`Meal updated: id=${id}`, MealsService.name);
    return result;
  }

  async delete(id: string): Promise<void> {
    await this._repository.delete(id);
    this._logger.log(`Meal deleted: id=${id}`, MealsService.name);
  }
}
