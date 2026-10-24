import { Inject, Injectable } from '@nestjs/common';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { IdentityType } from '@food-up/shared';
import { SuppliersService } from 'src/core/suppliers/application/suppliers.service';
import { Supplier } from 'src/core/suppliers/domain/supplier.entity';
import { DomainEvents } from 'src/shared/application/domain-events/domain-events.decorator';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { MenuPeriod } from '../domain/menu-period.entity';
import {
  I_MENU_PERIODS_REPOSITORY,
  IMenuPeriodsRepository,
} from '../domain/menu-periods.repository.interface';

@Injectable()
export class MenuPeriodsService {
  constructor(
    @Inject(I_MENU_PERIODS_REPOSITORY)
    private readonly _repository: IMenuPeriodsRepository,
    private readonly _identityService: IdentityService,
    private readonly _suppliersService: SuppliersService,
  ) {}

  @DomainEvents
  async create(
    identityId: string,
    dto: {
      startDate: string;
      endDate: string;
      supplierId?: string;
    },
  ): Promise<MenuPeriod> {
    const supplier = await this._resolveManagedSupplier(identityId, dto.supplierId);

    const entity = MenuPeriod.create(dto.startDate, dto.endDate, supplier.id);

    await this._repository.insert(entity);
    return entity;
  }

  async findBySupplier(supplierId: string, identityId: string): Promise<MenuPeriod[]> {
    await this._suppliersService.assertCanView(supplierId, identityId);
    return this._repository.findByCriteria({ supplierId } as any);
  }

  async findOne(id: string): Promise<MenuPeriod> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  async findBulkByIds(ids: string[]): Promise<MenuPeriod[]> {
    return this._repository.findBulkByIds(ids);
  }

  @DomainEvents
  async update(
    id: string,
    identityId: string,
    dto: { startDate?: string; endDate?: string },
  ): Promise<MenuPeriod> {
    const menuPeriod = await this._repository.findOneByCriteriaOrThrow({ id });

    await this._suppliersService.assertCanManage(menuPeriod.supplierId, identityId);

    menuPeriod.updateDetails(dto.startDate, dto.endDate);

    await this._repository.update(id, menuPeriod);
    return menuPeriod;
  }

  async delete(id: string, identityId: string): Promise<void> {
    const existing = await this._repository.findOneByCriteriaOrThrow({ id });

    await this._suppliersService.assertCanManage(existing.supplierId, identityId);

    return this._repository.delete(id);
  }

  /**
   * Resolves the supplier a new menu period is created for: the given supplier, or the caller's own
   * supplier account if none is given. The caller must be allowed to manage it.
   */
  private async _resolveManagedSupplier(
    identityId: string,
    supplierId?: string,
  ): Promise<Supplier> {
    if (supplierId) {
      return this._suppliersService.assertCanManage(supplierId, identityId);
    }

    const identity = await this._identityService.findById(identityId);
    if (identity?.type !== IdentityType.Supplier) {
      throw new InvalidInputDataException(
        'Employee must specify a supplier ID to manage menu periods',
      );
    }
    return this._suppliersService.findByIdentityId(identityId);
  }
}
