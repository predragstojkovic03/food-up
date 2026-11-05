import { Inject, Injectable } from '@nestjs/common';
import { BusinessSuppliersService } from 'src/core/business-suppliers/application/business-suppliers.service';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { IdentityService } from 'src/core/identity/application/identity.service';
import {
  EmployeeRole,
  IdentityType,
  Language,
  SupplierType,
} from '@food-up/shared';
import { DomainEvents } from 'src/shared/application/domain-events/domain-events.decorator';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import {
  I_TRANSACTION_RUNNER,
  ITransactionRunner,
} from 'src/shared/application/transaction.runner';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { AccessDeniedException } from 'src/shared/domain/exceptions/access-denied.exception';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { Supplier } from '../domain/supplier.entity';
import {
  I_SUPPLIERS_REPOSITORY,
  ISuppliersRepository,
} from '../domain/suppliers.repository.interface';
import { RegisterSupplierDto } from './dto/register-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @Inject(I_SUPPLIERS_REPOSITORY)
    private readonly _repository: ISuppliersRepository,
    private readonly _identityService: IdentityService,
    private readonly _employeesService: EmployeesService,
    @Inject(I_TRANSACTION_RUNNER)
    private readonly _transactionRunner: ITransactionRunner,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
    private readonly _businessSuppliersService: BusinessSuppliersService,
  ) {}

  @DomainEvents
  async register(dto: RegisterSupplierDto): Promise<Supplier> {
    return this._transactionRunner.run(async () => {
      const identity = await this._identityService.create({
        email: dto.email,
        password: dto.password,
        type: IdentityType.Supplier,
        isActive: false,
      });

      const supplier = Supplier.register(dto.name, dto.email, identity.id);

      await this._repository.insert(supplier);
      this._logger.log(
        `Supplier registered: id=${supplier.id} name=${dto.name}`,
        SuppliersService.name,
      );
      return supplier;
    });
  }

  @DomainEvents
  async createManagedSupplier(
    sub: string,
    dto: { email?: string; name: string; language: Language },
  ) {
    const employee = await this._employeesService.findByIdentity(sub);

    if (employee.role !== EmployeeRole.Manager) {
      throw new AccessDeniedException('Only managers can manage suppliers.');
    }

    const supplier = Supplier.createManaged(
      dto.name,
      dto.email ?? null,
      [employee.businessId],
      employee.businessId,
      dto.language,
    );

    await this._repository.insert(supplier);
    this._logger.log(
      `Managed supplier created: id=${supplier.id} name=${dto.name} businessId=${employee.businessId}`,
      SuppliersService.name,
    );
    return supplier;
  }

  async findManagedByBusiness(identityId: string): Promise<Supplier[]> {
    const employee = await this._employeesService.findByIdentity(identityId);
    return this._repository.findManagedByBusiness(employee.businessId);
  }

  async findPartnersByBusiness(identityId: string): Promise<Supplier[]> {
    const employee = await this._employeesService.findByIdentity(identityId);
    return this._repository.findPartnersByBusiness(employee.businessId);
  }

  async findOne(id: string): Promise<Supplier> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  findByIdentityId(id: string): Promise<Supplier> {
    return this._repository.findOneByCriteriaOrThrow({ identityId: id });
  }

  @DomainEvents
  async update(
    id: string,
    identityId: string,
    dto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this._repository.findOneByCriteriaOrThrow({ id });

    if (supplier.type === SupplierType.Standalone) {
      // Partner suppliers serve several businesses; only managed suppliers' language is editable
      if (dto.language !== undefined) {
        throw new InvalidInputDataException(
          'Language can only be changed for managed suppliers.',
        );
      }
      if (supplier.identityId !== identityId) {
        this._logger.warn(
          `Unauthorized supplier update attempt: supplierId=${id} identityId=${identityId}`,
          SuppliersService.name,
        );
        throw new AccessDeniedException(
          'Not authorized to update this supplier.',
        );
      }
      supplier.updateInfo(dto.name, dto.email);
    } else {
      const employee = await this._employeesService.findByIdentity(identityId);
      if (
        employee.businessId !== supplier.managingBusinessId ||
        employee.role !== EmployeeRole.Manager
      ) {
        this._logger.warn(
          `Unauthorized supplier update attempt: supplierId=${id} identityId=${identityId}`,
          SuppliersService.name,
        );
        throw new AccessDeniedException(
          'Not authorized to update this supplier.',
        );
      }
      supplier.updateInfo(dto.name, dto.email);
      if (dto.language !== undefined) supplier.language = dto.language;
    }

    await this._repository.update(id, supplier);
    this._logger.log(`Supplier updated: id=${id}`, SuppliersService.name);

    return supplier;
  }

  async delete(id: string, identityId: string): Promise<void> {
    await this.assertCanManage(id, identityId);
    await this._repository.delete(id);
    this._logger.log(`Supplier deleted: id=${id}`, SuppliersService.name);
  }

  /**
   * A supplier's catalog and menus can be changed by the standalone supplier itself,
   * or by a manager of the business that manages it. Anyone else gets "not found".
   */
  async assertCanManage(
    supplierId: string,
    identityId: string,
  ): Promise<Supplier> {
    const supplier = await this._repository.findOneByCriteriaOrThrow({
      id: supplierId,
    });
    if (await this._isOwnerOrManagingManager(supplier, identityId))
      return supplier;
    throw this._accessDenied(supplierId, identityId);
  }

  /** Viewing additionally allows managers of businesses that partner with the supplier. */
  async assertCanView(
    supplierId: string,
    identityId: string,
  ): Promise<Supplier> {
    const supplier = await this._repository.findOneByCriteriaOrThrow({
      id: supplierId,
    });
    if (await this._isOwnerOrManagingManager(supplier, identityId))
      return supplier;

    const manager = await this._findManager(identityId);
    if (manager) {
      const link =
        await this._businessSuppliersService.findBySupplierAndBusiness(
          supplierId,
          manager.businessId,
        );
      if (link) return supplier;
    }
    throw this._accessDenied(supplierId, identityId);
  }

  private async _isOwnerOrManagingManager(
    supplier: Supplier,
    identityId: string,
  ): Promise<boolean> {
    if (supplier.identityId && supplier.identityId === identityId) return true;
    const manager = await this._findManager(identityId);
    return !!manager && supplier.managingBusinessId === manager.businessId;
  }

  /** The caller's employee record if they are a manager, otherwise null. */
  private async _findManager(identityId: string) {
    const identity = await this._identityService.findById(identityId);
    if (identity?.type !== IdentityType.Employee) return null;
    const employee = await this._employeesService.findByIdentity(identityId);
    return employee.role === EmployeeRole.Manager ? employee : null;
  }

  private _accessDenied(
    supplierId: string,
    identityId: string,
  ): EntityInstanceNotFoundException {
    this._logger.warn(
      `Supplier access denied: supplierId=${supplierId} identityId=${identityId}`,
      SuppliersService.name,
    );
    return new EntityInstanceNotFoundException(
      `Supplier ${supplierId} not found`,
    );
  }
}
