import { BusinessSupplier } from '../../domain/business-supplier.entity';
import { IBusinessSuppliersRepository } from '../../domain/business-suppliers.repository.interface';

export interface UpdateBusinessSupplierDto {
  businessId?: string;
  supplierId?: string;
  isManaged?: boolean;
}

export class UpdateBusinessSupplierUseCase {
  constructor(private readonly repository: IBusinessSuppliersRepository) {}

  async execute(
    id: string,
    dto: UpdateBusinessSupplierDto,
  ): Promise<BusinessSupplier> {
    const existing = await this.repository.findOneByCriteria({ id });
    if (!existing) throw new Error('BusinessSupplier not found');
    const updated = new BusinessSupplier(
      id,
      dto.businessId ?? existing.businessId,
      dto.supplierId ?? existing.supplierId,
      dto.isManaged ?? existing.isManaged,
    );
    return this.repository.update(id, updated);
  }
}
