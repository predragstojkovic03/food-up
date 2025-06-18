import { Supplier } from '../../domain/supplier.entity';
import { ISuppliersRepository } from '../../domain/suppliers.repository.interface';

export class FindSupplierUseCase {
  constructor(private readonly repository: ISuppliersRepository) {}

  async execute(id: string): Promise<Supplier | null> {
    return this.repository.findOneByCriteria({ id });
  }
}
