import { BusinessSupplier } from '../../domain/business-supplier.entity';
import { IBusinessSuppliersRepository } from '../../domain/business-suppliers.repository.interface';

export class FindAllBusinessSuppliersUseCase {
  constructor(private readonly repository: IBusinessSuppliersRepository) {}

  async execute(): Promise<BusinessSupplier[]> {
    return this.repository.findAll();
  }
}
