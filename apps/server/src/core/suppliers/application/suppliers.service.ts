import { Inject, Injectable } from '@nestjs/common';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { IdentityType } from 'src/core/identity/domain/identity.entity';
import { DomainEvents } from 'src/shared/application/domain-events/domain-events.decorator';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { ulid } from 'ulid';
import { SupplierType } from '../domain/supplier-type.enum';
import { Supplier } from '../domain/supplier.entity';
import {
  I_SUPPLIERS_REPOSITORY,
  ISuppliersRepository,
} from '../domain/suppliers.repository.interface';
import { RegisterSupplierDto } from '../presentation/rest/dto/create-supplier.dto';
import { UpdateSupplierDto } from '../presentation/rest/dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @Inject(I_SUPPLIERS_REPOSITORY)
    private readonly _repository: ISuppliersRepository,
    private readonly _identityService: IdentityService,
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

  async findAll(): Promise<Supplier[]> {
    return this._repository.findAll();
  }

  async findOne(id: string): Promise<Supplier | null> {
    return this._repository.findOneByCriteria({ id });
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const existing = await this._repository.findOneByCriteria({ id });
    if (!existing)
      throw new EntityInstanceNotFoundException('Supplier not found');
    return this._repository.update(id, { ...existing, ...dto } as any);
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }
}
