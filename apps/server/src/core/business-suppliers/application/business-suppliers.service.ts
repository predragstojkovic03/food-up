import { Inject, Injectable } from '@nestjs/common';
import { BusinessSupplier } from '../domain/business-supplier.entity';
import {
  I_BUSINESS_SUPPLIERS_REPOSITORY,
  IBusinessSuppliersRepository,
} from '../domain/business-suppliers.repository.interface';

@Injectable()
export class BusinessSuppliersService {
  constructor(
    @Inject(I_BUSINESS_SUPPLIERS_REPOSITORY)
    private readonly repo: IBusinessSuppliersRepository,
  ) {}

  async create(dto: any): Promise<BusinessSupplier> {
    // Map DTO to entity
    const entity = new BusinessSupplier(dto.id, dto.businessId, dto.supplierId);
    return this.repo.insert(entity);
  }

  async findAll(): Promise<BusinessSupplier[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<BusinessSupplier | null> {
    return this.repo.findOneByCriteria({ id });
  }

  async update(id: string, dto: any): Promise<BusinessSupplier> {
    // Map DTO to entity
    const entity = new BusinessSupplier(id, dto.businessId, dto.supplierId);
    return this.repo.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
