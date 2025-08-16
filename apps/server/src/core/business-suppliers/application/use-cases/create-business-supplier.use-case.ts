import { FindSupplierUseCase } from 'src/core/suppliers/application/use-cases/find-supplier.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { ulid } from 'ulid';
import { BusinessSupplier } from '../../domain/business-supplier.entity';
import { IBusinessSuppliersRepository } from '../../domain/business-suppliers.repository.interface';

export interface CreateBusinessSupplierDto {
  businessId: string;
  supplierId: string;
  isManaged: boolean;
}

export class CreateBusinessSupplierUseCase {
  constructor(
    private readonly _repository: IBusinessSuppliersRepository,
    private readonly _findSupplierUseCase: FindSupplierUseCase,
  ) {}

  async execute(dto: CreateBusinessSupplierDto): Promise<BusinessSupplier> {
    const supplier = await this._findSupplierUseCase.execute(dto.supplierId);
    if (!supplier) {
      throw new EntityInstanceNotFoundException('Supplier not found');
    }
    const entity = new BusinessSupplier(ulid(), dto.businessId, dto.supplierId);
    return this._repository.insert(entity);
  }
}
