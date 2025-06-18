import { BusinessSupplier } from '../../domain/business-supplier.entity';
import { IBusinessSuppliersRepository } from '../../domain/business-suppliers.repository.interface';

export class FindBusinessSupplierUseCase {
  constructor(private readonly repository: IBusinessSuppliersRepository) {}

  async execute(id: string): Promise<BusinessSupplier | null> {
    return this.repository.findOneByCriteria({ id });
  }
}
