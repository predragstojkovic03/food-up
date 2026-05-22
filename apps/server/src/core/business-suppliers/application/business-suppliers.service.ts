import { Inject, Injectable } from '@nestjs/common';
import { Language } from '@food-up/shared';
import { BusinessSupplier } from '../domain/business-supplier.entity';
import {
  I_BUSINESS_SUPPLIERS_REPOSITORY,
  IBusinessSuppliersRepository,
} from '../domain/business-suppliers.repository.interface';

@Injectable()
export class BusinessSuppliersService {
  constructor(
    @Inject(I_BUSINESS_SUPPLIERS_REPOSITORY)
    private readonly _repository: IBusinessSuppliersRepository,
  ) {}

  async create(dto: any): Promise<BusinessSupplier> {
    // Map DTO to entity
    const entity = new BusinessSupplier(dto.id, dto.businessId, dto.supplierId);
    return this._repository.insert(entity);
  }

  async findAll(): Promise<BusinessSupplier[]> {
    return this._repository.findAll();
  }

  async findOne(id: string): Promise<BusinessSupplier | null> {
    return this._repository.findOneByCriteria({ id });
  }

  async update(id: string, dto: any): Promise<BusinessSupplier> {
    // Map DTO to entity
    const entity = new BusinessSupplier(id, dto.businessId, dto.supplierId);
    return this._repository.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    return this._repository.delete(id);
  }

  async findBySupplierAndBusiness(
    supplierId: string,
    businessId: string,
  ): Promise<BusinessSupplier | null> {
    return this._repository.findBySupplierAndBusiness(supplierId, businessId);
  }

  async updateLanguageForPartner(
    supplierId: string,
    businessId: string,
    language: Language,
  ): Promise<void> {
    const bs = await this._repository.findBySupplierAndBusiness(
      supplierId,
      businessId,
    );
    if (!bs) return;
    bs.language = language;
    await this._repository.update(bs.id, bs);
  }
}
