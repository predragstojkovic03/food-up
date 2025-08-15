import { FindBusinessUseCase } from 'src/core/businesses/application/use-cases/find-business.use-case';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { ulid } from 'ulid';
import { Supplier } from '../../domain/supplier.entity';
import { ISuppliersRepository } from '../../domain/suppliers.repository.interface';

export interface CreateSupplierDto {
  name: string;
  type: 'registered' | 'external';
  contactInfo: string;
  businessIds?: string[];
  userId?: string | null;
}

export class CreateSupplierUseCase {
  constructor(
    private readonly _repository: ISuppliersRepository,
    private readonly _findBusinessUseCase: FindBusinessUseCase,
  ) {}

  async execute(dto: CreateSupplierDto): Promise<Supplier> {
    if (dto.businessIds) {
      for (const businessId of dto.businessIds) {
        const business = await this._findBusinessUseCase.execute(businessId);
        if (!business) {
          throw new EntityInstanceNotFoundException('Business not found');
        }
      }
    }

    const supplier = new Supplier(
      ulid(),
      dto.name,
      dto.type,
      dto.contactInfo,
      dto.businessIds,
    );
    return this._repository.insert(supplier);
  }
}
