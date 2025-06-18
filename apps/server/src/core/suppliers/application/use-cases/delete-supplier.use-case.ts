import { ISuppliersRepository } from '../../domain/suppliers.repository.interface';

export class DeleteSupplierUseCase {
  constructor(private readonly repository: ISuppliersRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
