import { Business } from 'src/core/businesses/domain/business.entity';
import { Supplier } from 'src/core/suppliers/domain/supplier.entity';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { ulid } from 'ulid';
import { BusinessSupplier } from '../../domain/business-supplier.entity';
import { IBusinessSuppliersRepository } from '../../domain/business-suppliers.repository.interface';

export class ConnectBusinessesToSupplierUseCase {
  constructor(private readonly _repository: IBusinessSuppliersRepository) {}

  async execute(
    supplier: Supplier,
    businesses: Business[],
  ): Promise<BusinessSupplier[]> {
    if (!supplier || !businesses || businesses.length === 0) {
      throw new InvalidInputDataException('Invalid supplier or businesses');
    }

    const businessSuppliers: BusinessSupplier[] = businesses.map(
      (business) => new BusinessSupplier(ulid(), business.id, supplier.id),
    );

    return this._repository.insertMany(businessSuppliers);
  }
}
