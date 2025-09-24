import { Inject, Injectable } from '@nestjs/common';
import { BusinessesService } from 'src/core/businesses/application/businesses.service';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { DomainEvents } from 'src/shared/application/domain-events/domain-events.decorator';
import { AuthenticationException } from 'src/shared/domain/exceptions/authentication.exception';
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
  ) {}

  @DomainEvents
  async create(
    identityId: string,
    dto: {
      startDate: Date;
      endDate: Date;
      supplierId: string;
    },
  ): Promise<MenuPeriod> {
    await this.authorizeAccess(identityId, dto.supplierId);

    const entity = new MenuPeriod(
      ulid(),
      dto.startDate,
      dto.endDate,
      dto.supplierId,
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
    const existing = await this.repo.findOneByCriteriaOrThrow({ id });

    await this.authorizeAccess(identityId, existing.supplierId);

    const entity = new MenuPeriod(
      id,
      dto.startDate ?? existing.startDate,
      dto.endDate ?? existing.endDate,
      existing.supplierId,
    );

    await this.repo.update(id, entity);
    return entity;
  }

  async delete(id: string, identityId: string): Promise<void> {
    const existing = await this.repo.findOneByCriteriaOrThrow({ id });

    await this.authorizeAccess(identityId, existing.supplierId);

    return this.repo.delete(id);
  }

  /**
   * Authorizes access for the user based on their identity and the requested menu period.
   * @param identityId The ID of the user making the request.
   * @param supplierId The ID of the supplier associated with the menu period.
   * @throws {AuthenticationException} if the identity is invalid.
   * @throws {UnauthorizedException} if the user is not authorized to create or modify the menu period.
   */
  private async authorizeAccess(identityId: string, supplierId: string) {
    const identity = await this._identityService.findById(identityId);

    if (!identity) {
      throw new AuthenticationException('Invalid identity');
    }

    if (identity.type === IdentityType.Employee) {
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
    } else if (
      identity.type === IdentityType.Supplier &&
      identity.id !== supplierId
    ) {
      throw new UnauthorizedException(
        'Supplier can only manage menu periods for themselves',
      );
    }
  }
}
