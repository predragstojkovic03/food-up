import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { Supplier } from '../../domain/supplier.entity';
import { ISuppliersRepository } from '../../domain/suppliers.repository.interface';

export class FindSupplierUseCase {
  constructor(private readonly repository: ISuppliersRepository) {}

  async execute(id: string): Promise<Supplier> {
    const supplier = await this.repository.findOneByCriteria({ id });
    if (!supplier)
      throw new EntityInstanceNotFoundException('Supplier not found');
    return supplier;
  }
}
