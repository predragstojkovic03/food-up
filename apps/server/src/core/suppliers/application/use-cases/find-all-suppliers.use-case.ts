import { Supplier } from '../../domain/supplier.entity';
import { ISuppliersRepository } from '../../domain/suppliers.repository.interface';

export class FindAllSuppliersUseCase {
  constructor(private readonly repository: ISuppliersRepository) {}

  async execute(): Promise<Supplier[]> {
    return this.repository.findAll();
  }
}
