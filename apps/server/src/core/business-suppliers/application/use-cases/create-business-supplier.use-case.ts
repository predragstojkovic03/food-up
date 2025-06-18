import { ulid } from 'ulid';
import { BusinessSupplier } from '../../domain/business-supplier.entity';
import { IBusinessSuppliersRepository } from '../../domain/business-suppliers.repository.interface';

export interface CreateBusinessSupplierDto {
  businessId: string;
  supplierId: string;
  isManaged: boolean;
}

export class CreateBusinessSupplierUseCase {
  constructor(private readonly repository: IBusinessSuppliersRepository) {}

  async execute(dto: CreateBusinessSupplierDto): Promise<BusinessSupplier> {
    const entity = new BusinessSupplier(
      ulid(),
      dto.businessId,
      dto.supplierId,
      dto.isManaged,
    );
    return this.repository.insert(entity);
  }
}
