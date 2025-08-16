import { ConnectBusinessesToSupplierUseCase } from 'src/core/business-suppliers/application/use-cases/connect-businesses-to-supplier.use-case';
import { FindBusinessesBulkUseCase } from 'src/core/business-suppliers/application/use-cases/find-businesses-bulk.use-case';
import { FindBusinessUseCase } from 'src/core/businesses/application/use-cases/find-business.use-case';
import { Business } from 'src/core/businesses/domain/business.entity';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { ulid } from 'ulid';
import { SupplierType } from '../../domain/supplier-type.enum';
import { Supplier } from '../../domain/supplier.entity';
import { ISuppliersRepository } from '../../domain/suppliers.repository.interface';

export interface CreateSupplierDto {
  name: string;
  type: SupplierType;
  contactInfo: string;
  businessIds?: string[];
  userId?: string | null;
  managingBusinessId?: string;
}

export class CreateSupplierUseCase {
  constructor(
    private readonly _repository: ISuppliersRepository,
    private readonly _findBusinessUseCase: FindBusinessUseCase,
    private readonly _connectBusinessesToSupplierUseCase: ConnectBusinessesToSupplierUseCase,
    private readonly _findBusinessesBulkUseCase: FindBusinessesBulkUseCase,
  ) {}

  async execute(dto: CreateSupplierDto): Promise<Supplier> {
    let businesses: Business[] = [];
    if (dto.type === SupplierType.Registered && dto.businessIds) {
      businesses = await this._findBusinessesBulkUseCase.execute(
        dto.businessIds,
      );

      if (businesses.length !== dto.businessIds.length) {
        throw new InvalidInputDataException('Some business IDs do not exist');
      }
    }

    if (dto.type === SupplierType.External) {
      const business = await this._findBusinessUseCase.execute(
        dto.managingBusinessId as string,
      );
      if (!business) {
        throw new EntityInstanceNotFoundException('Business not found');
      }
    }

    const supplier = new Supplier(
      ulid(),
      dto.name,
      dto.type,
      dto.contactInfo,
      dto.businessIds,
      dto.managingBusinessId,
    );

    const savedSupplier = this._repository.insert(supplier);

    if (dto.type === SupplierType.External) {
      if (!dto.managingBusinessId) {
        throw new InvalidInputDataException(
          'Managing business ID is required for external suppliers',
        );
      }

      if (!dto.managingBusinessId) {
        throw new InvalidInputDataException(
          'Managing business ID is required for external suppliers',
        );
      }
    }

    if (dto.type === SupplierType.Registered && businesses.length > 0) {
      await this._connectBusinessesToSupplierUseCase.execute(
        supplier,
        businesses,
      );
    }
    return savedSupplier;
  }
}
