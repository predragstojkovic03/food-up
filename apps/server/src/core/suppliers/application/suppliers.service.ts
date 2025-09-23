import { Inject, Injectable } from '@nestjs/common';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { DomainEvents } from 'src/shared/application/domain-events/domain-events.decorator';
import { UnauthorizedException } from 'src/shared/domain/exceptions/unauthorized.exception';
import { EmployeeRole } from 'src/shared/domain/role.enum';
import { ulid } from 'ulid';
import { SupplierType } from '../domain/supplier-type.enum';
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
  ) {}

  @DomainEvents
  async register(dto: RegisterSupplierDto): Promise<Supplier> {
    const identity = await this._identityService.create({
      email: dto.email,
      password: dto.password,
      type: IdentityType.Supplier,
      isActive: false,
    });

    const supplier = new Supplier(
      ulid(),
      dto.name,
      SupplierType.Standalone,
      dto.contactInfo,
      undefined,
      undefined,
      identity.id,
    );

    await this._repository.insert(supplier);
    return supplier;
  }

  @DomainEvents
  async createManagedSupplier(
    sub: string,
    dto: { contactInfo: string; name: string },
  ) {
    const employee = await this._employeesService.findByIdentity(sub);

    if (employee.role !== EmployeeRole.Manager) {
      throw new UnauthorizedException('Only managers can manage suppliers.');
    }

    const supplier = new Supplier(
      ulid(),
      dto.name,
      SupplierType.Managed,
      dto.contactInfo,
      [employee.businessId],
      employee.businessId,
    );

    await this._repository.insert(supplier);
    return supplier;
  }

  async findAll(): Promise<Supplier[]> {
    return this._repository.findAll();
  }

  async findOne(id: string): Promise<Supplier> {
    return this._repository.findOneByCriteriaOrThrow({ id });
  }

  @DomainEvents
  async update(
    id: string,
    identityId: string,
    dto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this._repository.findOneByCriteriaOrThrow({ id });

    if (supplier.type === SupplierType.Standalone) {
      if (supplier.identityId !== identityId) {
        throw new UnauthorizedException(
          'Not authorized to update this supplier.',
        );
      }
    } else {
      const employee = await this._employeesService.findByIdentity(identityId);
      if (
        employee.businessId !== supplier.managingBusinessId ||
        employee.role !== EmployeeRole.Manager
      ) {
        throw new UnauthorizedException(
          'Not authorized to update this supplier.',
        );
      }
    }

    supplier.updateInfo(dto.name, dto.contactInfo);
    await this._repository.update(id, supplier);

    return supplier;
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
