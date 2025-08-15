import { FindBusinessUseCase } from 'src/core/businesses/application/use-cases/find-business.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { Supplier } from '../../domain/supplier.entity';
import { ISuppliersRepository } from '../../domain/suppliers.repository.interface';

export interface UpdateSupplierDto {
  name?: string;
  type?: 'registered' | 'external';
  contactInfo?: string;
  businessIds?: string[];
  userId?: string | null;
}

export class UpdateSupplierUseCase {
  constructor(
    private readonly _repository: ISuppliersRepository,
    private readonly _findBusinessUseCase: FindBusinessUseCase,
  ) {}

  async execute(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const existing = await this._repository.findOneByCriteria({ id });

    if (!existing)
      throw new EntityInstanceNotFoundException('Supplier not found');

    if (dto.businessIds) {
      for (const businessId of dto.businessIds) {
        const business = await this._findBusinessUseCase.execute(businessId);
        if (!business) {
          throw new EntityInstanceNotFoundException('Business not found');
        }
      }
    }

    const updated = new Supplier(
      id,
      dto.name ?? existing.name,
      dto.type ?? existing.type,
      dto.contactInfo ?? existing.contactInfo,
      dto.businessIds ?? existing.businessIds,
    );
    return this._repository.update(id, updated);
  }
}
