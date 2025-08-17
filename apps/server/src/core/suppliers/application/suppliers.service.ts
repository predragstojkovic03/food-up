import { Injectable } from '@nestjs/common';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { Supplier } from '../domain/supplier.entity';
import { ISuppliersRepository } from '../domain/suppliers.repository.interface';
import { CreateSupplierDto } from '../presentation/rest/dto/create-supplier.dto';
import { UpdateSupplierDto } from '../presentation/rest/dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly _repository: ISuppliersRepository) {}

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    // Add any business logic/validation here
    return this._repository.insert(dto as any);
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
