import { Inject, Injectable } from '@nestjs/common';
import { BusinessesService } from 'src/core/businesses/application/businesses.service';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { SuppliersService } from 'src/core/suppliers/application/suppliers.service';
import { Supplier } from 'src/core/suppliers/domain/supplier.entity';
import { DomainEvents } from 'src/shared/application/domain-events/domain-events.decorator';
import { AuthenticationException } from 'src/shared/domain/exceptions/authentication.exception';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { UnauthorizedException } from 'src/shared/domain/exceptions/unauthorized.exception';
import { ulid } from 'ulid';
import { MenuPeriod } from '../domain/menu-period.entity';
import {
  I_MENU_PERIODS_REPOSITORY,
  IMenuPeriodsRepository,
} from '../domain/menu-periods.repository.interface';

@Injectable()
export class MenuPeriodsService {
  constructor(
    @Inject(I_MENU_PERIODS_REPOSITORY)
    private readonly repo: IMenuPeriodsRepository,
    private readonly _identityService: IdentityService,
    private readonly _businessesService: BusinessesService,
    private readonly _employeesService: EmployeesService,
    private readonly _suppliersService: SuppliersService,
  ) {}

  @DomainEvents
  async create(
    identityId: string,
    dto: {
      startDate: Date;
      endDate: Date;
      supplierId?: string;
    },
  ): Promise<MenuPeriod> {
    const supplier = await this.validateOrGetSupplier(
      identityId,
      dto.supplierId,
    );

    const entity = new MenuPeriod(
      ulid(),
      dto.startDate,
      dto.endDate,
      supplier.id,
    );

    await this.repo.insert(entity);
    return entity;
  }

  async findAll(): Promise<MenuPeriod[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<MenuPeriod> {
    return this.repo.findOneByCriteriaOrThrow({ id });
  }

  async findBulkByIds(ids: string[]): Promise<MenuPeriod[]> {
    return this.repo.findBulkByIds(ids);
  }

  @DomainEvents
  async update(
    id: string,
    identityId: string,
    dto: { startDate?: Date; endDate?: Date },
  ): Promise<MenuPeriod> {
    const menuPeriod = await this.repo.findOneByCriteriaOrThrow({ id });

    await this.validateOrGetSupplier(identityId, menuPeriod.supplierId);

    menuPeriod.updateDetails(dto.startDate, dto.endDate);

    await this.repo.update(id, menuPeriod);
    return menuPeriod;
  }

  async delete(id: string, identityId: string): Promise<void> {
    const existing = await this.repo.findOneByCriteriaOrThrow({ id });

    await this.validateOrGetSupplier(identityId, existing.supplierId);

    return this.repo.delete(id);
  }

  /**
   * Authorizes access for the user based on their identity and the requested menu period.
   * @param identityId The ID of the user making the request.
   * @param supplierId The ID of the supplier associated with the menu period.
   * @throws {AuthenticationException} if the identity is invalid.
   * @throws {UnauthorizedException} if the user is not authorized to create or modify the menu period.
   */
  private async validateOrGetSupplier(
    identityId: string,
    supplierId?: string,
  ): Promise<Supplier> {
    const identity = await this._identityService.findById(identityId);

    if (!identity) {
      throw new AuthenticationException('Invalid identity');
    }

    if (identity.type === IdentityType.Employee) {
      if (!supplierId) {
        throw new InvalidInputDataException(
          'Employee must specify a supplier ID to manage menu periods',
        );
      }

      const employee = await this._employeesService.findByIdentity(identity.id);
      const business = await this._businessesService.findOne(
        employee.businessId,
      );

      if (
        business.managedSupplierIds.length === 0 ||
        !business.managedSupplierIds.includes(supplierId)
      ) {
        throw new UnauthorizedException(
          'The business does not manage the specified supplier',
        );
      }

      return this._suppliersService.findOne(supplierId);
    } else if (identity.type === IdentityType.Supplier) {
      return this._suppliersService.findByIdentityId(identity.id);
    }

    throw new UnauthorizedException();
  }
}
